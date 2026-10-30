# Mobile Employee App — Project Requirements

## 1. Project Overview
A React Native application built with Expo and TypeScript to manage employee information. The application supports authentication, employee listing, employee details, employee creation and editing, profile management, and API integration.

## 2. Target Users and Roles
- **Authenticated User:** Logs in and accesses the employee management application.
- **Administrator (planned role):** Can be assigned permission to add, edit, and delete employee records.
- **Role-based permissions:** Must be confirmed against the actual business requirements and backend authorization rules.

## 3. Required Screens
1. **Login:** Accept credentials and handle authentication errors.
2. **Home:** Display the main application dashboard.
3. **Employee List:** Display employees with search, refresh, and pagination where supported.
4. **Employee Details:** Display information about a selected employee.
5. **Add Employee:** Collect and validate new employee information.
6. **Edit Employee:** Update an existing employee's information.
7. **Profile:** Display user information and support profile-related actions.

## 4. Application Navigation Flow
Login → Home → Employee List → Employee Details.

From the Employee List, users can navigate to Add Employee or Edit Employee. The Profile screen is accessible through the application's navigation.

Authentication should be checked before allowing access to protected screens. Logging out should clear the authenticated session and return the user to Login.

## 5. Proposed Folder Structure
- `screens/` — Screen-level UI.
- `components/` — Reusable UI components such as EmployeeCard.
- `navigation/` — Stack navigator and route definitions.
- `services/` — API requests, notifications, and profile image operations.
- `hooks/` — Reusable custom React hooks.
- `context/` — Shared authentication and application state.
- `types/` — Shared TypeScript interfaces and navigation types.
- `utils/` — Helper functions and validation utilities.
- `assets/` — Images, icons, and other static assets.
- `App.tsx` — Application entry component.

Existing screen implementations are currently concentrated in `App.tsx`; moving them into separate screen and navigation files is a planned refactoring step.

## 6. TypeScript Interfaces
The shared types should describe employee data, authenticated user information, API responses, form inputs, and navigation parameters.

The employee model should include the fields required by the backend, such as ID, name, email, phone, department, and designation. Actual field names must match the API response.

## 7. API Requirements
Current API base URL: `https://dummyjson.com`.

Required operations:
- Authenticate a user.
- Retrieve the employee list.
- Retrieve an individual employee.
- Create an employee.
- Update an employee.
- Delete an employee.

The current DummyJSON service is suitable for demonstration and learning. Its write operations may simulate changes rather than persist them permanently. Production use requires an approved backend and verified API contracts.

## 8. Authentication Flow
1. User enters login credentials.
2. The application sends the credentials to the authentication endpoint.
3. The application handles loading, success, and error states.
4. Successful authentication stores the session using the existing authentication implementation.
5. Protected screens become available.
6. Logout clears the session and returns the user to Login.

The production authentication and token-storage strategy must be confirmed with the backend/security requirements.

## 9. Reusable UI Components
- EmployeeCard
- Form inputs and validation messages
- Reusable buttons
- Loading indicators
- Error and success messages
- Confirmation dialogs
- Common screen layouts

## 10. Environment Configuration
- `.env` — Local environment configuration; do not commit it.
- `.env.example` — Safe configuration template for developers.
- `.gitignore` — Excludes local environment files.
- `EXPO_PUBLIC_API_URL` — API base URL exposed to the Expo application.

Development and production should use separately configured API URLs. Values prefixed with `EXPO_PUBLIC_` are bundled into the client application and must not contain secrets.

## 11. Development and Production
**Development**
- Use the local development server.
- Use the development API URL.
- Run TypeScript checks and validate application behavior.

**Production**
- Configure the approved production API URL.
- Verify authentication, error handling, and API contracts.
- Build the application using the appropriate Expo/EAS configuration.
- Never include private API keys or server secrets in client-side environment variables.

## 12. Quality Requirements
- Reusable, maintainable components.
- Consistent TypeScript types.
- Clear loading, empty, success, and error states.
- Responsive mobile UI.
- Secure authentication handling.
- Appropriate list rendering and API performance.
- Automated tests for important components and user interactions.

## 13. Current Setup and Remaining Work
Completed:
- Expo React Native and TypeScript project setup.
- Existing API service and reusable EmployeeCard component.
- Authentication context moved into `context/`.
- Shared TypeScript definitions started in `types/`.
- Local `.env` and `.env.example` created.
- Environment files added to `.gitignore`.
- API service configured to read `EXPO_PUBLIC_API_URL`.
- TypeScript check passed.

Remaining:
- Separate screen components from `App.tsx`.
- Create a dedicated root navigator and typed routes.
- Add custom hooks and utility functions where appropriate.
- Confirm role-based permissions and production API requirements.
- Add automated tests.
- Verify development and production configuration.
- Run final project checks and review Git changes.