"""Add location score

Revision ID: 718107ad0c50
Revises: 9fbacb723d45
Create Date: 2026-07-30 09:24:13.991673

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '718107ad0c50'
down_revision: Union[str, None] = '9fbacb723d45'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('analysis_results', schema=None) as batch_op:
        batch_op.add_column(sa.Column('location_score', sa.Numeric(precision=5, scale=2), server_default='0', nullable=False))
        batch_op.alter_column('selection_status',
               existing_type=sa.TEXT(),
               type_=sa.String(length=50),
               existing_nullable=True,
               existing_server_default=sa.text('(NULL)'))
        batch_op.alter_column('percentile',
               existing_type=sa.REAL(),
               type_=sa.Numeric(precision=5, scale=2),
               existing_nullable=True,
               existing_server_default=sa.text('(NULL)'))


def downgrade() -> None:
    with op.batch_alter_table('analysis_results', schema=None) as batch_op:
        batch_op.alter_column('percentile',
               existing_type=sa.Numeric(precision=5, scale=2),
               type_=sa.REAL(),
               existing_nullable=True,
               existing_server_default=sa.text('(NULL)'))
        batch_op.alter_column('selection_status',
               existing_type=sa.String(length=50),
               type_=sa.TEXT(),
               existing_nullable=True,
               existing_server_default=sa.text('(NULL)'))
        batch_op.drop_column('location_score')
