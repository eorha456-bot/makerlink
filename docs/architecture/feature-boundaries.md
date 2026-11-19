# Feature boundaries

| Folder | Responsibility | Must not contain |
| --- | --- | --- |
| `apps/web/src/features/auth` | Kakao login UI and session state | API server code or SQL |
| `apps/web/src/features/marketplace` | Request/supply feed, detail, filter and post UI | dashboard aggregation |
| `apps/web/src/features/analytics` | Marketing metrics and dashboard UI | post creation form logic |
| `apps/api/src/modules/auth` | OAuth callback and user creation | post business logic |
| `apps/api/src/modules/posts` | Post CRUD and view/click events | offer status updates |
| `apps/api/src/modules/offers` | Supplier offers and matching states | OAuth logic |
| `apps/api/src/modules/analytics` | Aggregate dashboard queries | individual event creation |

## Primary user flow

`Kakao login → company profile → material request/supply post → view/contact event → supplier offer → matching status → analytics dashboard`
