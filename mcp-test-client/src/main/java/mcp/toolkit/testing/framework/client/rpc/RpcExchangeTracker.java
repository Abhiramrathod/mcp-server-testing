package mcp.toolkit.testing.framework.client.rpc;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

public final class RpcExchangeTracker {

    private final CopyOnWriteArrayList<RpcExchange> exchanges = new CopyOnWriteArrayList<>();

    void record(RpcExchange exchange) {
        if (exchange != null) exchanges.add(exchange);
    }

    public List<RpcExchange> all() {
        return Collections.unmodifiableList(exchanges);
    }

    public Optional<RpcExchange> last() {
        return exchanges.isEmpty() ? Optional.empty() : Optional.of(exchanges.get(exchanges.size() - 1));
    }

    public List<RpcExchange> forMethod(String method) {
        return exchanges.stream().filter(e -> method.equals(e.method())).collect(Collectors.toUnmodifiableList());
    }

    public Optional<RpcExchange> byId(long requestId) {
        return exchanges.stream().filter(e -> e.id() == requestId).findFirst();
    }

    public List<RpcExchange> withStatus(RpcExchange.Status status) {
        return exchanges.stream().filter(e -> e.status() == status).collect(Collectors.toUnmodifiableList());
    }

    public int size() { return exchanges.size(); }

    public void clear() { exchanges.clear(); }
}
