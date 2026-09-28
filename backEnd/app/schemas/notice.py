from datetime import date

from typing import Literal

from pydantic import AwareDatetime, BaseModel, Field, HttpUrl


class RentOption(BaseModel):
    label: str = Field(min_length=1)

    deposit_won: int | None = Field(default=None, ge=0)
    monthly_rent_won: int | None = Field(default=None, ge=0)

    conditions_note: str | None = None
    source_ref: str | None = None

class HousingUnit(BaseModel):
    id: str = Field(min_length=1)
    name: str = Field(min_length=1)

    address: str | None = None
    exclusive_area_m2: float | None = Field(default=None, gt=0)

    rent_options: list[RentOption] = Field(default_factory=list)


class DocumentAccess(BaseModel):
    method: Literal["download", "issue_page", "visit"]
    label: str = Field(min_length=1)
    url: HttpUrl | None = None
    instructions: str | None = None


class RequiredDocument(BaseModel):
    id: str = Field(min_length=1)
    name: str = Field(min_length=1)

    applies_to: str | None = None
    preparation_order: int | None = Field(default=None, ge=1)

    issue_date_note: str | None = None
    processing_time_note: str | None = None
    submission_deadline: AwareDatetime | None = None

    access_methods: list[DocumentAccess] = Field(default_factory=list)
    source_ref: str | None = None


class Notice(BaseModel):
    id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    agency: str = Field(min_length=1)
    region: str = Field(min_length=1)

    source_url: HttpUrl
    published_on: date | None = None

    application_starts_at: AwareDatetime | None = None
    application_ends_at: AwareDatetime | None = None

    reviewed: bool = False
    housing_units: list[HousingUnit] = Field(default_factory=list)
    documents: list[RequiredDocument] = Field(default_factory=list)