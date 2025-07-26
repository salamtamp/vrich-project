import re
from collections.abc import Callable
from typing import Any


class ValidationService:
    """Service for validating data using Pydantic-style validation rules."""

    def __init__(self):
        self.validators: dict[str, Callable] = {
            "required": self._validate_required,
            "optional": self._validate_optional,
            "positive_number": self._validate_positive_number,
            "non_negative_number": self._validate_non_negative_number,
            "min_length": self._validate_min_length,
            "max_length": self._validate_max_length,
            "email": self._validate_email,
            "url": self._validate_url,
            "integer": self._validate_integer,
            "float": self._validate_float,
            "unique": self._validate_unique,  # Placeholder for database validation
        }

    def validate_value(
        self, value: Any, rules: list[str], field_name: str
    ) -> list[str]:
        """Validate a value against a list of validation rules."""
        errors = []

        for rule_str in rules:
            rule_str = rule_str.strip()

            # Parse rule with parameters
            if ":" in rule_str:
                rule_name, param_str = rule_str.split(":", 1)
                rule_name = rule_name.strip()
                param_str = param_str.strip()
                # Handle negative numbers and zero properly
                try:
                    if ((param_str.startswith('-') and param_str[1:].isdigit()) or
                        param_str.isdigit()):
                        param_value = int(param_str)
                    else:
                        param_value = param_str
                except ValueError:
                    param_value = param_str
            else:
                rule_name = rule_str
                param_value = None

            # Get validator function
            validator_func = self.validators.get(rule_name)
            if validator_func:
                try:
                    # Only pass parameter to functions that need it
                    if (param_value is not None and
                        rule_name in ["min_length", "max_length"]):
                        validator_func(value, field_name, param_value)
                    else:
                        validator_func(value, field_name)
                except ValueError as e:
                    errors.append(str(e))
            else:
                errors.append(f"Unknown validation rule: {rule_name}")

        return errors

    def _validate_required(self, value: Any, field_name: str) -> None:
        """Validate that a field is required (not empty)."""
        if value is None or (isinstance(value, str) and not value.strip()):
            raise ValueError(f"Required field '{field_name}' is missing or empty")

    def _validate_optional(self, value: Any, field_name: str) -> None:
        """Validate that a field is optional (can be empty)."""
        # Optional fields can be empty, so no validation needed

    def _validate_positive_number(self, value: Any, field_name: str) -> None:
        """Validate that a value is a positive number."""
        if value is None or (isinstance(value, str) and not value.strip()):
            return  # Skip validation for empty values

        try:
            num_value = float(value)
        except (ValueError, TypeError) as err:
            raise ValueError(f"Field '{field_name}' must be a valid number") from err

        if num_value <= 0:
            raise ValueError(f"Field '{field_name}' must be a positive number")

    def _validate_non_negative_number(self, value: Any, field_name: str) -> None:
        """Validate that a value is a non-negative number."""
        if value is None or (isinstance(value, str) and not value.strip()):
            return  # Skip validation for empty values

        try:
            num_value = float(value)
        except (ValueError, TypeError) as err:
            raise ValueError(f"Field '{field_name}' must be a valid number") from err

        if num_value < 0:
            raise ValueError(f"Field '{field_name}' must be a non-negative number")

    def _validate_min_length(
        self, value: Any, field_name: str, min_length: int
    ) -> None:
        """Validate minimum length of a string."""
        if value is None or (isinstance(value, str) and not value.strip()):
            return  # Skip validation for empty values

        if len(str(value).strip()) < min_length:
            raise ValueError(
                f"Field '{field_name}' must be at least {min_length} characters long"
            )

    def _validate_max_length(
        self, value: Any, field_name: str, max_length: int
    ) -> None:
        """Validate maximum length of a string."""
        if value is None or (isinstance(value, str) and not value.strip()):
            return  # Skip validation for empty values

        if len(str(value).strip()) > max_length:
            raise ValueError(
                f"Field '{field_name}' must be no more than "
                f"{max_length} characters long"
            )

    def _validate_email(self, value: Any, field_name: str) -> None:
        """Validate email format."""
        if value is None or (isinstance(value, str) and not value.strip()):
            return  # Skip validation for empty values

        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, str(value).strip()):
            raise ValueError(f"Field '{field_name}' must be a valid email address")

    def _validate_url(self, value: Any, field_name: str) -> None:
        """Validate URL format."""
        if value is None or (isinstance(value, str) and not value.strip()):
            return  # Skip validation for empty values

        url_pattern = r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$'
        if not re.match(url_pattern, str(value).strip()):
            raise ValueError(f"Field '{field_name}' must be a valid URL")

    def _validate_integer(self, value: Any, field_name: str) -> None:
        """Validate that a value is an integer."""
        if value is None or (isinstance(value, str) and not value.strip()):
            return  # Skip validation for empty values

        try:
            int(float(value))  # Convert to float first to handle "1.0" -> 1
        except (ValueError, TypeError) as err:
            raise ValueError(f"Field '{field_name}' must be a valid integer") from err

    def _validate_float(self, value: Any, field_name: str) -> None:
        """Validate that a value is a float."""
        if value is None or (isinstance(value, str) and not value.strip()):
            return  # Skip validation for empty values

        try:
            float(value)
        except (ValueError, TypeError) as err:
            raise ValueError(f"Field '{field_name}' must be a valid number") from err

    def _validate_unique(self, value: Any, field_name: str) -> None:
        """Validate that a value is unique (placeholder for database validation)."""
        # This would need to be implemented with database checking
        # For now, we'll skip this validation in the service layer


# Create singleton instance
validation_service = ValidationService()
