from datetime import UTC, datetime, timedelta

from sqlalchemy import Column, DateTime, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.api.dependencies.pagination import OrderDirection, PaginationBuilder

Base = declarative_base()


class DummyModel(Base):
    __tablename__ = "dummy"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    value = Column(Integer)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    deleted_at = Column(DateTime, nullable=True)


def setup_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_cls = sessionmaker(bind=engine)
    return session_cls()


def seed_data(session):
    now = datetime.now(UTC)
    items = [
        DummyModel(name="Alice", value=10, created_at=now - timedelta(days=3)),
        DummyModel(name="Bob", value=20, created_at=now - timedelta(days=2)),
        DummyModel(name="Charlie", value=30, created_at=now - timedelta(days=1)),
        DummyModel(name="David", value=40, created_at=now),
    ]
    session.add_all(items)
    session.commit()
    return items


def test_pagination_filtering():
    session = setup_db()
    items = seed_data(session)
    builder = PaginationBuilder(DummyModel, session)
    # Filter since (should exclude Alice)
    since = items[1].created_at
    result = builder.date_range(since=since).paginate()
    assert result.total == 3
    assert all(doc["name"] != "Alice" for doc in result.docs)


def test_pagination_until():
    session = setup_db()
    items = seed_data(session)
    builder = PaginationBuilder(DummyModel, session)
    # Filter until (should exclude David)
    until = items[2].created_at
    result = builder.date_range(until=until).paginate()
    assert result.total == 3
    assert all(doc["name"] != "David" for doc in result.docs)


def test_pagination_limit_offset():
    session = setup_db()
    seed_data(session)
    builder = PaginationBuilder(DummyModel, session)
    result = builder.order_by("created_at", OrderDirection.ASC).paginate(
        limit=2, offset=1
    )
    assert result.limit == 2
    assert result.offset == 1
    assert len(result.docs) == 2
    assert result.total == 4
    # Should be Bob and Charlie (second and third oldest)
    assert result.docs[0]["name"] == "Bob"
    assert result.docs[1]["name"] == "Charlie"


def test_pagination_ordering():
    session = setup_db()
    seed_data(session)
    # Descending order (default)
    builder_desc = PaginationBuilder(DummyModel, session)
    result = builder_desc.order_by("created_at", OrderDirection.DESC).paginate()
    assert result.docs[0]["name"] == "David"
    # Ascending order
    builder_asc = PaginationBuilder(DummyModel, session)
    result = builder_asc.order_by("created_at", OrderDirection.ASC).paginate()
    assert result.docs[0]["name"] == "Alice"


def test_pagination_search():
    session = setup_db()
    seed_data(session)
    builder = PaginationBuilder(DummyModel, session)
    # Search by name
    result = builder.search(search="Bob", search_by="name").paginate()
    assert result.total == 1
    assert result.docs[0]["name"] == "Bob"


def test_pagination_search_by_value():
    session = setup_db()
    seed_data(session)
    builder = PaginationBuilder(DummyModel, session)
    # Search by value (non-string field)
    result = builder.search(search=20, search_by="value").paginate()
    assert result.total == 1
    assert result.docs[0]["name"] == "Bob"


def test_pagination_total_and_docs():
    session = setup_db()
    seed_data(session)
    builder = PaginationBuilder(DummyModel, session)
    result = builder.paginate()
    assert result.total == 4
    assert len(result.docs) == 4
    assert all("name" in doc for doc in result.docs)


def test_pagination_all_params():
    session = setup_db()
    items = seed_data(session)
    # search for names containing 'a', between Bob and David,
    # order by value ascending, limit 1, offset 1
    since = items[1].created_at  # Bob's created_at
    until = items[3].created_at  # David's created_at
    builder = PaginationBuilder(DummyModel, session)
    result = (
        builder.date_range(since=since, until=until)
        .search(search="a", search_by="name")
        .order_by("value", OrderDirection.ASC)
        .paginate(limit=1, offset=1)
    )
    # Candidates after filtering: Bob (excluded by search),
    # Charlie (matches), David (matches)
    # After search: Charlie, David
    # Order by value ascending: Charlie (30), David (40)
    # Limit 1, offset 1: David
    assert result.total == 2  # Charlie and David match
    assert result.limit == 1
    assert result.offset == 1
    assert len(result.docs) == 1
    assert result.docs[0]["name"] == "David"


def test_pagination_since():
    session = setup_db()
    items = seed_data(session)
    since = items[1].created_at  # Bob's created_at
    builder = PaginationBuilder(DummyModel, session)
    result = builder.date_range(since=since).paginate()
    # Should include Bob, Charlie, David
    assert result.total == 3
    assert {doc["name"] for doc in result.docs} == {"Bob", "Charlie", "David"}


def test_pagination_limit():
    session = setup_db()
    seed_data(session)
    builder = PaginationBuilder(DummyModel, session)
    result = builder.paginate(limit=2)
    assert result.limit == 2
    assert len(result.docs) == 2


def test_pagination_offset():
    session = setup_db()
    seed_data(session)
    builder = PaginationBuilder(DummyModel, session)
    result = builder.order_by("created_at", OrderDirection.ASC).paginate(offset=2)
    # Should skip Alice and Bob, so Charlie and David remain
    assert result.offset == 2
    assert len(result.docs) == 2
    assert result.docs[0]["name"] == "Charlie"
    assert result.docs[1]["name"] == "David"


def test_pagination_order():
    session = setup_db()
    seed_data(session)
    builder = PaginationBuilder(DummyModel, session)
    # Descending order
    result = builder.order_by("created_at", OrderDirection.DESC).paginate()
    assert result.docs[0]["name"] == "David"
    # Ascending order
    builder = PaginationBuilder(DummyModel, session)
    result = builder.order_by("created_at", OrderDirection.ASC).paginate()
    assert result.docs[0]["name"] == "Alice"


def test_pagination_order_by():
    session = setup_db()
    seed_data(session)
    builder = PaginationBuilder(DummyModel, session)
    # Order by value ascending
    result = builder.order_by("value", OrderDirection.ASC).paginate()
    assert [doc["name"] for doc in result.docs] == ["Alice", "Bob", "Charlie", "David"]
    # Order by value descending
    builder = PaginationBuilder(DummyModel, session)
    result = builder.order_by("value", OrderDirection.DESC).paginate()
    assert [doc["name"] for doc in result.docs] == ["David", "Charlie", "Bob", "Alice"]


def test_pagination_search_by():
    session = setup_db()
    seed_data(session)
    builder = PaginationBuilder(DummyModel, session)
    result = builder.search(search=30, search_by="value").paginate()
    assert result.total == 1
    assert result.docs[0]["name"] == "Charlie"


# Mix cases
def test_pagination_since_and_limit():
    session = setup_db()
    items = seed_data(session)
    since = items[1].created_at  # Bob's created_at
    builder = PaginationBuilder(DummyModel, session)
    result = builder.date_range(since=since).paginate(limit=2)
    assert result.total == 3
    assert result.limit == 2
    assert len(result.docs) == 2
    assert {doc["name"] for doc in result.docs}.issubset({"Bob", "Charlie", "David"})


def test_pagination_search_and_order():
    session = setup_db()
    seed_data(session)
    builder = PaginationBuilder(DummyModel, session)
    result = (
        builder.search(search="a", search_by="name")
        .order_by("value", OrderDirection.DESC)
        .paginate()
    )
    # Should match Alice, Charlie, David (all have 'a'), ordered by value descending
    assert [doc["name"] for doc in result.docs] == ["David", "Charlie", "Alice"]


def test_pagination_offset_and_search():
    session = setup_db()
    seed_data(session)
    builder = PaginationBuilder(DummyModel, session)
    result = (
        builder.search(search="a", search_by="name")
        .order_by("value", OrderDirection.ASC)
        .paginate(offset=1)
    )
    # Should match Alice, Charlie, David
    # (all have 'a'), ordered by value ascending, offset 1
    assert [doc["name"] for doc in result.docs] == ["Charlie", "David"]
