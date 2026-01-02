---
inclusion: fileMatch
fileMatchPattern: "**/*.{jsx,tsx}"
---
# React Component Guidelines

## Component Structure
- Đặt imports ở đầu file (React, libraries, components, utils, styles)
- Export default ở cuối file
- Tách logic phức tạp ra custom hooks

## Naming Conventions
- Components: PascalCase (UserProfile.jsx)
- Hooks: camelCase với prefix "use" (useAuth, useToast)
- Event handlers: prefix "handle" (handleClick, handleSubmit)

## Best Practices
- Sử dụng destructuring cho props
- Memoize với useMemo/useCallback khi cần
- Cleanup effects trong useEffect return
