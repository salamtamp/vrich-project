from pydantic import BaseModel


class Message(BaseModel):
    message: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: str | None = None


class FacebookPostWebhookRequest(BaseModel):
    event: str
    id: str


class FacebookInboxWebhookRequest(BaseModel):
    event: str
    id: str


class FacebookCommentWebhookRequest(BaseModel):
    event: str
    id: str


class FacebookProfileWebhookRequest(BaseModel):
    event: str
    id: str
