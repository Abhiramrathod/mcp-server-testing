package mcp.toolkit.testing.framework.transport.netty;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpResponse;
import io.netty.handler.codec.http.LastHttpContent;

import java.util.concurrent.atomic.AtomicReference;

/**
 * Per-connection inbound handler that routes HTTP objects to the currently
 * dispatched {@link PendingExchange} and manages the channel's place in the
 * connection pool.
 *
 * <p>Channels stay open across requests (HTTP/1.1 keep-alive): the handler is
 * created once at connection time and the {@code current} exchange is swapped on
 * each dispatch. When a response is fully received the channel is handed back to
 * the pool, or closed when the server requested {@code Connection: close}.
 */
final class PooledHttpHandler extends SimpleChannelInboundHandler<Object> {

    private final NettyTransportClient owner;
    private final String poolKey;
    private final AtomicReference<PendingExchange> current = new AtomicReference<>();

    PooledHttpHandler(NettyTransportClient owner, String poolKey) {
        this.owner = owner;
        this.poolKey = poolKey;
    }

    /**
     * Binds this channel to the given exchange, or fails if the channel is
     * already busy with another exchange.
     *
     * @param exchange exchange to dispatch
     * @return {@code true} if this channel now owns the exchange
     */
    boolean acquire(PendingExchange exchange) {
        return current.compareAndSet(null, exchange);
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) {
        PendingExchange exchange = current.get();
        if (exchange == null) {
            return;
        }
        if (msg instanceof HttpResponse response) {
            exchange.onHeaders(response.protocolVersion(), response.status().code(), response.headers());
        } else if (msg instanceof HttpContent content) {
            byte[] bytes = new byte[content.content().readableBytes()];
            content.content().readBytes(bytes);
            if (exchange.onContent(bytes, msg instanceof LastHttpContent)) {
                finishExchange(ctx);
            }
        }
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) {
        PendingExchange exchange = current.getAndSet(null);
        if (exchange != null) {
            exchange.onInactive();
        }
        owner.evict(poolKey, ctx.channel());
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        PendingExchange exchange = current.getAndSet(null);
        if (exchange != null) {
            exchange.onException(cause);
        }
        owner.evict(poolKey, ctx.channel());
        ctx.close();
    }

    private void finishExchange(ChannelHandlerContext ctx) {
        PendingExchange exchange = current.getAndSet(null);
        if (exchange == null) {
            return;
        }
        if (exchange.keepAlive() && ctx.channel().isActive()) {
            owner.release(poolKey, ctx.channel());
        } else {
            ctx.close();
        }
    }
}
