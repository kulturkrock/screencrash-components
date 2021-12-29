# screencrash-components
Repository for the loose components (screen, audio, robot etc.) of Screencrash (also known as Skärmkrock)

## Running components
You can use make to run individual (or all) components. See table below.

| Command         | Result                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------- |
| make -j2 dev    | Run all components (audio, screen) in parallell. Log output will be to the same terminal. |
| make dev_screen | Run screen component in develop mode (refresh on file changes)                            |
| make dev_audio  | Run audio component in develop mode (refresh on file changes)                             |