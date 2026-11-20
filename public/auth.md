# auth.md

This document is for automated agents that read the public MyBCAT catalog.

## Audience

The public catalog at https://mybcat.com is read-only. It lists solutions, industries, comparisons, case studies, and glossary terms. An agent does not register and does not need a credential to read it.

## Methods

The supported method is none. Send an anonymous GET request. Do not send an Authorization header. The server does not issue a token for these resources.

## Registration

There is no agent registration endpoint. A practice that wants a MyBCAT account uses the human contact page at https://mybcat.com/contact/. That page starts a staff conversation. It does not issue an API credential.

## Credential use

The public catalog does not accept a bearer token, an API key, or a client secret. A credential does not grant more access to the published JSON resources. Do not call a registration URL. This site does not publish OAuth Protected Resource Metadata or an OAuth authorization server.

## Discovery

- API catalog: https://mybcat.com/.well-known/api-catalog
- API description: https://mybcat.com/.well-known/openapi.json
- Human docs: https://mybcat.com/truth-layer/
- Security contact: https://mybcat.com/.well-known/security.txt
