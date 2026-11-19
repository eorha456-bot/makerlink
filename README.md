# MakerLink

제조기업이 모바일에서 자재 요청과 공급 제안을 주고받는 서비스입니다. Railway에서는 Express가 React 빌드 결과와 API를 한 HTTPS 주소에서 제공합니다.

## Railway 팀 시연 배포

1. 이 소스를 팀의 GitHub 저장소에 올립니다. 저장소 첫 화면에서 Dockerfile, railway.json, package.json, apps 폴더가 함께 보여야 합니다. 배포용 압축본에는 개인 환경변수 파일이 들어 있지 않습니다.
2. Railway에 빈 프로젝트를 만들고 New → Database → MySQL을 선택합니다. DB 서비스 이름과 상태를 확인합니다. 앱과 DB는 같은 프로젝트와 환경에 둡니다.
3. 같은 프로젝트에서 New → GitHub Repo로 앱 저장소를 연결합니다. Root Directory는 저장소 루트입니다. Dockerfile과 railway.json이 빌드·실행·상태 확인을 설정합니다. 환경변수를 입력하기 전에 시작된 배포가 실패하면 다음 단계 후 재배포합니다.
4. 앱 서비스의 Variables → RAW Editor에 아래 값을 넣습니다. MySQL 서비스 이름이 다르면 참조식의 MySQL을 실제 이름으로 바꿉니다.

```env
MYSQL_HOST=${{MySQL.MYSQLHOST}}
MYSQL_PORT=${{MySQL.MYSQLPORT}}
MYSQL_USER=${{MySQL.MYSQLUSER}}
MYSQL_PASSWORD=${{MySQL.MYSQLPASSWORD}}
MYSQL_DATABASE=${{MySQL.MYSQLDATABASE}}
PORT=8080
KAKAO_REST_API_KEY=<카카오 REST API 키>
KAKAO_CLIENT_SECRET=<카카오 로그인용 클라이언트 시크릿>
APP_SESSION_SECRET=<직접 생성한 무작위 값>
```

   세 개의 꺾쇠 자리에는 실제 값을 넣습니다. 세션 키는 본인 터미널에서 다음 명령으로 한 번 생성하고 재배포 시에도 동일한 값을 사용합니다.

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

5. 앱 서비스의 Settings → Networking → Public Networking → Generate Domain에서 공개 도메인을 생성합니다. 대상 포트를 물으면 8080입니다. 변경 사항을 Deploy하고 도메인 생성 전 이미 실행 중이었다면 Redeploy합니다. 기본 설정에서는 RAILWAY_PUBLIC_DOMAIN으로 HTTPS 복귀 주소와 카카오 콜백 주소를 자동 생성합니다. 로컬 .env 전체를 가져오면 기존 WEB_ORIGIN 또는 KAKAO_REDIRECT_URI가 우선하므로 위 변수만 입력하세요.
6. 배포 로그에 MakerLink is ready가 나타나면 실제 도메인의 /api/ready를 엽니다. {"status":"ready"}가 정상입니다. 앱이 참조된 DB에 users, companies, posts, post_events, offers 테이블을 생성합니다. 이 배포는 새 시연 DB를 사용하며 로컬 데이터 이관은 별도입니다.
7. 카카오디벨로퍼스에서 기존 앱 → 앱 → 플랫폼 키 → 사용 중인 REST API 키 → 카카오 로그인 리다이렉트 URI에 https://실제도메인/api/auth/kakao/callback 을 추가·저장합니다. 카카오 로그인 사용 설정은 ON, 클라이언트 시크릿은 카카오 로그인용 값을 사용합니다. 테스트 앱을 사용한다면 시연 계정의 앱 멤버 권한도 확인합니다.
8. 팀원에게 https://실제도메인 을 공유합니다. 각자 모바일 Chrome/Safari에서 로그인 후 기업 정보를 등록합니다. A가 자재 요청을 등록하고 B가 새로고침하여 공급 제안을 보냅니다. A가 내 활동에서 채택하면 B의 보낸 제안과 A의 성과 화면에서 결과를 볼 수 있습니다.

## 점검

- Missing variables는 로그에 표시된 변수 이름을 앱 서비스의 Variables에서 확인합니다.
- ER_ACCESS_DENIED_ERROR 또는 ENOTFOUND는 같은 환경의 MySQL 서비스 이름과 참조식을 확인합니다.
- KOE006은 실제 HTTPS 주소와 REST API 키에 등록한 콜백 경로를 끝의 슬래시까지 비교합니다.
- 로컬 주소로 이동하면 앱 서비스의 WEB_ORIGIN 및 KAKAO_REDIRECT_URI를 점검하고 공개 도메인 설정 후 재배포합니다.

## 로컬 개발

프로젝트 루트에서 npm ci 후 두 터미널에서 npm run dev:api 와 npm run dev:web 를 각각 실행합니다. 서버용 apps/api/.env의 변수 목록은 docs/architecture/environment-variables.md에 있습니다. 로컬 MySQL 초기 생성에는 docs/database/001-create-makerlink-schema.sql을 사용합니다.

공식 문서: [Railway MySQL](https://docs.railway.com/databases/mysql) · [변수 참조](https://docs.railway.com/variables) · [공개 도메인](https://docs.railway.com/networking/public-networking) · [카카오 앱 설정](https://developers.kakao.com/docs/ko/app-setting/app)
