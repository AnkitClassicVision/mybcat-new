# auth.md

You are an agent. The public MyBCAT catalog does not use agent registration. Read it without a credential.

## Audience

This file is for automated agents that read https://mybcat.com. The public catalog lists solutions, industries, comparisons, case studies, and glossary terms.

## Agent registration

The supported method is anonymous read. Do not register. Do not send an Authorization header. A GET request to a published catalog URL is the whole flow.

There is no agent registration endpoint. The contact page at https://mybcat.com/contact/ is for a human who wants to talk with MyBCAT staff. That page does not issue a client id, a client secret, or a bearer token.

## Credential use

The public catalog does not accept a bearer token, an API key, or a client secret. A credential does not grant more access to the published JSON resources.

This site does not publish OAuth Protected Resource Metadata. It does not publish an OAuth authorization server. Do not look for `agent_auth`, `register_uri`, or `identity_types_supported` on this host. Those fields are absent because this host does not run that flow.

## Discovery

- API catalog: https://mybcat.com/.well-known/api-catalog
- API description: https://mybcat.com/.well-known/openapi.json
- Human docs: https://mybcat.com/truth-layer/
- Security contact: https://mybcat.com/.well-known/security.txt
