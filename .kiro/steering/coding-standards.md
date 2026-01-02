# Coding Standards

## General Rules
- Sử dụng tiếng Việt cho UI và comments khi cần thiết
- Code phải clean, readable và maintainable
- Luôn xử lý errors và edge cases
- Viết code theo SOLID principles

## JavaScript/TypeScript
- Sử dụng ES6+ syntax
- Prefer `const` over `let`, avoid `var`
- Use async/await instead of callbacks
- Add JSDoc comments for functions

## React
- Functional components với hooks
- Tách logic ra custom hooks khi cần
- Props validation với PropTypes hoặc TypeScript

## Backend (Node.js)
- RESTful API design
- Proper error handling với try/catch
- Input validation và sanitization
- JWT authentication

## Database
- Google Sheets API cho small projects
- Proper indexing và query optimization

## Security
- Never commit secrets to Git
- Use environment variables
- Validate all user inputs
- HTTPS in production
