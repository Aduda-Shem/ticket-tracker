# core/exceptions.py
from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError


def serializer_exception_handler(exc, context):
    """
    Normalise every DRF error into {"message": "...", "errors": {...}} so the
    frontend can always show `message` and optionally highlight fields.
    """
    response = exception_handler(exc, context)

    if response is None:
        return response

    if isinstance(response.data, dict) and "detail" in response.data:
        response.data["message"] = response.data.pop("detail")
        return response

    if isinstance(exc, ValidationError):
        errors = response.data

        if isinstance(errors, dict):
            field, first_field_errors = next(iter(errors.items()))
            if isinstance(first_field_errors, list) and len(first_field_errors) > 0:
                message = str(first_field_errors[0])
            else:
                message = str(first_field_errors)
            if field != "non_field_errors":
                message = f"{field}: {message}"
        elif isinstance(errors, list) and len(errors) > 0:
            message = str(errors[0])
        else:
            message = str(errors)

        response.data = {"message": message, "errors": errors}

    return response
