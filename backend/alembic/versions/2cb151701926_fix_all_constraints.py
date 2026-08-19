"""fix_all_constraints

Revision ID: 2cb151701926
Revises: fe38bcbd8d61
Create Date: 2026-07-30 11:23:17.969859

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2cb151701926'
down_revision: Union[str, None] = 'fe38bcbd8d61'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("analysis_results") as batch_op:
        batch_op.drop_constraint("chk_ar_project_score", type_="check")
        batch_op.drop_constraint("chk_ar_readiness_score", type_="check")
        batch_op.create_check_constraint("chk_ar_project_score", "project_score BETWEEN 0 AND 100")
        batch_op.create_check_constraint("chk_ar_readiness_score", "readiness_score BETWEEN 0 AND 100")


def downgrade() -> None:
    with op.batch_alter_table("analysis_results") as batch_op:
        batch_op.drop_constraint("chk_ar_project_score", type_="check")
        batch_op.drop_constraint("chk_ar_readiness_score", type_="check")
        batch_op.create_check_constraint("chk_ar_project_score", "project_score BETWEEN 0 AND 20")
        batch_op.create_check_constraint("chk_ar_readiness_score", "readiness_score BETWEEN 0 AND 100")
