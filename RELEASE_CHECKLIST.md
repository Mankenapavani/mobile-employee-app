# Employee Hub — Release Checklist

## 1. Project and Build Configuration

- [x] Expo project configuration verified.
- [x] EAS development, preview, and production profiles verified.
- [x] App version checked: `1.0.0`.
- [x] Expo Doctor checks passed: 21/21.
- [ ] Create and validate a release candidate build.
- [ ] Record the build number, build profile, and build date.

## 2. Code Quality

- [x] TypeScript validation passed using `npx tsc --noEmit`.
- [x] Automated tests passed: 2 test suites, 10 tests.
- [ ] Run TypeScript validation after the final code changes.
- [ ] Run automated tests after the final code changes.
- [ ] Review Git changes before committing.

## 3. Authentication

- [ ] Verify successful login.
- [ ] Verify invalid credentials show a useful error.
- [ ] Verify protected screens require authentication.
- [ ] Verify logout clears the session.
- [ ] Verify expired-session handling.
- [ ] Confirm token storage meets production security requirements.

## 4. Employee Management

- [ ] Verify employee list loading.
- [ ] Verify employee details.
- [ ] Verify employee creation and input validation.
- [ ] Verify employee updates.
- [ ] Verify employee deletion, if supported by the UI.
- [ ] Verify loading, empty, and error states.

## 5. Offline and Network Failure Scenarios

- [ ] Load employee data while online.
- [ ] Enable airplane mode and verify cached data.
- [ ] Perform a supported offline action.
- [ ] Verify the pending action survives an app restart.
- [ ] Restore connectivity and verify synchronization.
- [ ] Verify a pending action is not applied twice.
- [ ] Test synchronization failure and recovery.
- [ ] Verify the online/offline indicator.
- [ ] Test unstable connectivity and API timeouts.

## 6. API Error Handling

- [ ] Verify network errors display a useful message.
- [ ] Verify request timeouts can be recovered from.
- [ ] Verify HTTP 401 and expired-session behavior.
- [ ] Verify server errors display an appropriate message.
- [ ] Verify retry behavior does not cause duplicate writes.
- [ ] Confirm logs do not expose tokens or sensitive information.

## 7. Profile and Media

- [ ] Verify profile information displays correctly.
- [ ] Verify image selection from the gallery.
- [ ] Verify permission denial and cancellation handling.
- [ ] Verify image-size validation.
- [ ] Verify upload progress, success, and failure handling.
- [ ] Verify retry behavior after upload failure.

## 8. Security and Environment

- [x] `.env` is ignored by Git.
- [x] `.env.example` contains the development API URL without private credentials.
- [ ] Confirm `.env` is not tracked or committed.
- [ ] Confirm production configuration uses the approved API URL.
- [ ] Confirm no private secrets are included in client-side environment variables.
- [ ] Confirm production authentication and backend requirements.

## 9. Release Build and Recovery

- [ ] Build the release candidate using the intended EAS profile.
- [ ] Install and test the build on a target device.
- [ ] Run the core regression checklist.
- [ ] Record build information and test results.
- [ ] Document known issues and limitations.
- [ ] Document the rollback or recovery procedure.
- [ ] Retain relevant screenshots or sanitized logs as evidence.

## 10. Git and Documentation

- [ ] Verify `README.md` setup instructions.
- [ ] Verify `PROJECT_REQUIREMENTS.md` matches the implementation.
- [ ] Update this checklist based on actual test results.
- [ ] Review `git status --short` and inspect the changed files.
- [ ] Commit the intended source, test, and documentation changes.
- [ ] Confirm no credentials, generated artifacts, or unrelated changes are included.

## Current Verification Evidence

- TypeScript: Passed; no errors reported.
- Automated tests: 2 suites passed, 10 tests passed.
- Expo Doctor: 21/21 checks passed.
- EAS configuration: Development, preview, and production profiles present.
- App version: `1.0.0`.
- Environment ignore check: `.env` is ignored by Git.

## Release Decision

**Status: Not yet confirmed release-ready.**

The checks above must be completed and their results recorded before approving a production release. Do not mark a test complete unless it has actually been performed.