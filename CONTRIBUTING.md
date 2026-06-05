Thanks for your interest in contributing to MCP Testing!

We welcome bug reports, improvements, and new examples. Please follow these guidelines to make your contribution smooth.

1. Before you start

- Search existing issues and discussions to avoid duplicates.
- If you're planning a larger change, open an issue first to discuss the approach.

2. Development setup

- Java 17+ and Maven 3.6+ are required.
- Build the project locally:

  ```bash
  mvn -T 1C clean install
  ```

- Run example tests:

  ```bash
  mvn -pl mcp-test-examples test
  ```

3. Branches and commits

- Create a feature branch from `master`:
  `git checkout -b feature/your-feature`
- Keep commits small and focused. Use clear commit messages.

4. Pull requests

- Push your branch to GitHub and open a Pull Request against `master`.
- Include a clear description of the change, motivation, and any relevant testing notes.
- CI will run tests; ensure your changes do not break the build.

5. Code style and tests

- Follow the project's existing Java coding style.
- Add unit tests for behavior changes and ensure existing tests pass.

6. Documentation

- Update `README.md` or `docs/` when public APIs or usage patterns change.
- Add examples to `mcp-test-examples` if introducing new features.

Thanks again! We appreciate your contributions and will review Pull Requests promptly.
