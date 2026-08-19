import asyncio
import json
from app.core.database import AsyncSessionLocal
from app.routers.dashboard import get_recruiter_dashboard
from app.models.user import User, UserRole

async def main():
    async with AsyncSessionLocal() as db:
        u = User(id='test', full_name='Test Recruiter', email='recruiter@rocas.ai', role=UserRole.recruiter)
        try:
            res = await get_recruiter_dashboard(current_user=u, db=db)
            print("SUCCESS:")
            print(json.dumps(res, indent=2, default=str))
        except Exception as e:
            print("ERROR IN ENDPOINT:", type(e), e)
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(main())
