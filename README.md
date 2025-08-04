# Yellowstone SPL Token Transfer Monitor

A TypeScript application for monitoring SPL token transfers on Solana using the Yellowstone gRPC client.

## Features

- Real-time SPL token transfer monitoring
- Automatic reconnection with exponential backoff
- Graceful shutdown handling
- Comprehensive error handling and logging
- Modular architecture with clear separation of concerns

## Project Structure

```
src/
├── config.ts              # Configuration constants and settings
├── types.ts               # Type definitions and type guards
├── logger.ts              # Centralized logging functionality
├── utils.ts               # Utility functions for data processing
├── transfer-parser.ts     # SPL token transfer parsing logic
├── transaction-handler.ts # Transaction processing and handling
├── stream-manager.ts      # gRPC stream connection management
└── main.ts               # Application entry point
```

## Architecture

The application follows a modular architecture with clear separation of concerns:

- **Configuration**: Centralized configuration management
- **Types**: Type-safe interfaces and type guards
- **Logging**: Consistent logging with emojis for better UX
- **Parsing**: Dedicated transfer instruction parsing
- **Handling**: Transaction processing and business logic
- **Streaming**: Robust gRPC stream management
- **Main**: Clean application entry point

## Key Improvements

### 1. **Modular Structure**
- Separated concerns into dedicated modules
- Clear interfaces between components
- Easier testing and maintenance

### 2. **Enhanced Error Handling**
- Custom error types for better error categorization
- Comprehensive error logging with stack traces
- Graceful error recovery

### 3. **Type Safety**
- Strict TypeScript configuration
- Type guards for runtime validation
- Comprehensive interface definitions

### 4. **Configuration Management**
- Centralized configuration constants
- Environment-specific settings
- Easy configuration updates

### 5. **Logging**
- Consistent logging format
- Emoji-based visual indicators
- Structured error reporting

### 6. **Code Quality**
- JSDoc comments for all public methods
- Consistent naming conventions
- Clean and readable code structure

## Usage

### Development
```bash
pnpm dev
```

### Build
```bash
pnpm build
```

### Production
```bash
pnpm start
```

## Configuration

Edit `src/config.ts` to modify:
- gRPC endpoint
- Reconnection settings
- Keepalive intervals
- Transfer instruction constants

## Error Handling

The application includes comprehensive error handling:
- Network connection errors with automatic reconnection
- Transaction parsing errors with detailed logging
- Uncaught exception handling
- Graceful shutdown on termination signals

## Monitoring

The application logs:
- Connection status and reconnection attempts
- Transfer details (sender, receiver, token, amount)
- Keepalive pings and slot updates
- Error conditions with stack traces

## Future Enhancements

- Database integration for persistent storage
- Metrics and monitoring
- Configuration via environment variables
- Unit and integration tests
- Docker containerization 