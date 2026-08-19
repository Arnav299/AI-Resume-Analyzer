"""fix_ats_constraints

Revision ID: fe38bcbd8d61
Revises: 718107ad0c50
Create Date: 2026-07-30 11:20:13.957623

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fe38bcbd8d61'
down_revision: Union[str, None] = '718107ad0c50'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("analysis_results") as batch_op:
        batch_op.drop_constraint("chk_ar_presence_score", type_="check")
        batch_op.drop_constraint("chk_ar_skill_score", type_="check")
        batch_op.create_check_constraint("chk_ar_presence_score", "professional_presence_score BETWEEN 0 AND 100")
        batch_op.create_check_constraint("chk_ar_skill_score", "skill_score BETWEEN 0 AND 100")


def downgrade() -> None:
    with op.batch_alter_table("analysis_results") as batch_op:
        batch_op.drop_constraint("chk_ar_presence_score", type_="check")
        batch_op.drop_constraint("chk_ar_skill_score", type_="check")
        batch_op.create_check_constraint("chk_ar_presence_score", "professional_presence_score BETWEEN 0 AND 10")
        batch_op.create_check_constraint("chk_ar_skill_score", "skill_score BETWEEN 0 AND 70")
