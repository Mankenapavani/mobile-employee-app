# Employee Hub — Mobile Employee Management App

## 1. Project Overview

Employee Hub is a mobile application built using React Native, Expo, and TypeScript. It allows users to log in, view employee information, add and edit employees, and manage their profile.

The application integrates with an API and supports local data caching and offline actions.

## 2. Technologies Used

- React Native
- Expo
- TypeScript
- Axios
- React Navigation
- AsyncStorage
- NetInfo
- Jest
- Expo EAS Build

## 3. Features

- User authentication and session management
- Employee listing and employee details
- Add and edit employee information
- Profile management
- Profile image selection and upload workflow
- API integration using Axios
- Local employee data caching
- Online/offline connectivity detection
- Queueing offline actions and synchronization
- Automated tests

## 4. Project Structure

```text
mobile-employee-app/
├── components/
├── context/
├── hooks/
├── navigation/
├── screens/
├── services/
├── types/
├── utils/
├── __tests__/
├── assets/
├── App.tsx
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env.example
└── PROJECT_REQUIREMENTS.md
```

## 5. Prerequisites

Install the following before running the application:

- Node.js and npm
- Git
- Expo-compatible development environment
- Android device or emulator for Android testing

## 6. Installation

Clone the repository and navigate to the project directory.

Install dependencies:

```bash
npm install
```

Create a local `.env` file using `.env.example` as a reference.

Configure the API URL:

```env
EXPO_PUBLIC_API_URL=https://dummyjson.com
```

Use the appropriate API URL for the intended environment.

## 7. Run the Application

Start the Expo development server:

```bash
npx expo start
```

Follow the terminal instructions to open the application on a compatible device or emulator.

## 8. TypeScript Validation

Run the TypeScript compiler without generating output:

```bash
npx tsc --noEmit
```

## 9. Automated Tests

Run the test suite:

```bash
npm test -- --runInBand
```

Latest recorded test result during development:

- Test suites passed: 2
- Tests passed: 10

Run the tests again after making further changes to confirm the current result.

## 10. Offline Support

The application uses local storage to cache employee data and retain pending offline actions.

When connectivity is unavailable, supported actions can be queued locally. When connectivity returns, pending actions can be synchronized with the API.

Offline behavior should be validated by testing connectivity loss, app restart, reconnection, and synchronization failures.

## 11. Environment and Security

- Keep local `.env` files out of version control.
- Maintain `.env.example` without credentials or private secrets.
- Do not place private API keys or server secrets in `EXPO_PUBLIC_` variables.
- Avoid logging authentication tokens or personal information.
- Confirm the production authentication and secure-storage requirements before release.

## 12. API Limitations

The development API is configured to use DummyJSON by default.

DummyJSON is suitable for demonstration and learning. Its create, update, and delete operations may simulate changes rather than permanently save them on the server.

A production deployment requires an approved backend and verified API contracts.

## 13. Build Configuration

Expo Application Services (EAS) configuration is maintained in `eas.json`.

Before a production release:

1. Verify the application version and build configuration.
2. Configure the approved production API URL.
3. Run TypeScript validation and automated tests.
4. Test authentication, employee management, offline behavior, and recovery.
5. Build and validate the release candidate.
6. Document known issues and rollback steps.

## 14. Known Limitations and Remaining Work

- Confirm production backend and authentication requirements.
- Verify secure token persistence against the project's security requirements.
- Complete and verify any remaining navigation and component refactoring.
- Evaluate performance and accessibility.
- Validate offline synchronization, retry behavior, and duplicate-operation prevention.
- Complete release regression testing and document rollback procedures.

Update this section as items are verified or completed.

## 15. Project Requirements

See `PROJECT_REQUIREMENTS.md` for the application requirements, screen flow, API operations, configuration, and quality expectations.