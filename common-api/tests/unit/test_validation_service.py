import pytest

from app.services.validation_service import ValidationService


class TestValidationService:
    """Test cases for ValidationService."""

    @pytest.fixture
    def validation_service(self):
        """Create a ValidationService instance for testing."""
        return ValidationService()

    def test_validate_required_success(self, validation_service):
        """Test required validation with valid value."""
        errors = validation_service.validate_value("test", ["required"], "test_field")
        assert errors == []

    def test_validate_required_empty_string(self, validation_service):
        """Test required validation with empty string."""
        errors = validation_service.validate_value("", ["required"], "test_field")
        assert len(errors) == 1
        assert "Required field 'test_field' is missing or empty" in errors[0]

    def test_validate_required_whitespace(self, validation_service):
        """Test required validation with whitespace only."""
        errors = validation_service.validate_value("   ", ["required"], "test_field")
        assert len(errors) == 1
        assert "Required field 'test_field' is missing or empty" in errors[0]

    def test_validate_required_none(self, validation_service):
        """Test required validation with None value."""
        errors = validation_service.validate_value(None, ["required"], "test_field")
        assert len(errors) == 1
        assert "Required field 'test_field' is missing or empty" in errors[0]

    def test_validate_optional_success(self, validation_service):
        """Test optional validation with valid value."""
        errors = validation_service.validate_value("test", ["optional"], "test_field")
        assert errors == []

    def test_validate_optional_empty(self, validation_service):
        """Test optional validation with empty value."""
        errors = validation_service.validate_value("", ["optional"], "test_field")
        assert errors == []

    def test_validate_optional_none(self, validation_service):
        """Test optional validation with None value."""
        errors = validation_service.validate_value(None, ["optional"], "test_field")
        assert errors == []

    def test_validate_positive_number_success(self, validation_service):
        """Test positive number validation with valid value."""
        errors = validation_service.validate_value("5", ["positive_number"], "test_field")
        assert errors == []

    def test_validate_positive_number_zero(self, validation_service):
        """Test positive number validation with zero."""
        errors = validation_service.validate_value("0", ["positive_number"], "test_field")
        assert len(errors) == 1
        assert "must be a positive number" in errors[0]

    def test_validate_positive_number_negative(self, validation_service):
        """Test positive number validation with negative value."""
        errors = validation_service.validate_value("-5", ["positive_number"], "test_field")
        assert len(errors) == 1
        assert "must be a positive number" in errors[0]

    def test_validate_positive_number_invalid(self, validation_service):
        """Test positive number validation with invalid value."""
        errors = validation_service.validate_value("abc", ["positive_number"], "test_field")
        assert len(errors) == 1
        assert "must be a valid number" in errors[0]

    def test_validate_positive_number_empty(self, validation_service):
        """Test positive number validation with empty value."""
        errors = validation_service.validate_value("", ["positive_number"], "test_field")
        assert errors == []  # Should skip validation for empty values

    def test_validate_non_negative_number_success(self, validation_service):
        """Test non-negative number validation with valid value."""
        errors = validation_service.validate_value("5", ["non_negative_number"], "test_field")
        assert errors == []

    def test_validate_non_negative_number_zero(self, validation_service):
        """Test non-negative number validation with zero."""
        errors = validation_service.validate_value("0", ["non_negative_number"], "test_field")
        assert errors == []

    def test_validate_non_negative_number_negative(self, validation_service):
        """Test non-negative number validation with negative value."""
        errors = validation_service.validate_value("-5", ["non_negative_number"], "test_field")
        assert len(errors) == 1
        assert "must be a non-negative number" in errors[0]

    def test_validate_min_length_success(self, validation_service):
        """Test min_length validation with valid value."""
        errors = validation_service.validate_value("hello", ["min_length:3"], "test_field")
        assert errors == []

    def test_validate_min_length_exact(self, validation_service):
        """Test min_length validation with exact length."""
        errors = validation_service.validate_value("abc", ["min_length:3"], "test_field")
        assert errors == []

    def test_validate_min_length_too_short(self, validation_service):
        """Test min_length validation with too short value."""
        errors = validation_service.validate_value("ab", ["min_length:3"], "test_field")
        assert len(errors) == 1
        assert "must be at least 3 characters long" in errors[0]

    def test_validate_min_length_empty(self, validation_service):
        """Test min_length validation with empty value."""
        errors = validation_service.validate_value("", ["min_length:3"], "test_field")
        assert errors == []  # Should skip validation for empty values

    def test_validate_max_length_success(self, validation_service):
        """Test max_length validation with valid value."""
        errors = validation_service.validate_value("hello", ["max_length:10"], "test_field")
        assert errors == []

    def test_validate_max_length_exact(self, validation_service):
        """Test max_length validation with exact length."""
        errors = validation_service.validate_value("abc", ["max_length:3"], "test_field")
        assert errors == []

    def test_validate_max_length_too_long(self, validation_service):
        """Test max_length validation with too long value."""
        errors = validation_service.validate_value("hello world", ["max_length:5"], "test_field")
        assert len(errors) == 1
        assert "must be no more than 5 characters long" in errors[0]

    def test_validate_email_success(self, validation_service):
        """Test email validation with valid email."""
        errors = validation_service.validate_value("test@example.com", ["email"], "test_field")
        assert errors == []

    def test_validate_email_invalid(self, validation_service):
        """Test email validation with invalid email."""
        errors = validation_service.validate_value("invalid-email", ["email"], "test_field")
        assert len(errors) == 1
        assert "must be a valid email address" in errors[0]

    def test_validate_email_empty(self, validation_service):
        """Test email validation with empty value."""
        errors = validation_service.validate_value("", ["email"], "test_field")
        assert errors == []  # Should skip validation for empty values

    def test_validate_url_success(self, validation_service):
        """Test URL validation with valid URL."""
        errors = validation_service.validate_value("https://example.com", ["url"], "test_field")
        assert errors == []

    def test_validate_url_invalid(self, validation_service):
        """Test URL validation with invalid URL."""
        errors = validation_service.validate_value("not-a-url", ["url"], "test_field")
        assert len(errors) == 1
        assert "must be a valid URL" in errors[0]

    def test_validate_url_empty(self, validation_service):
        """Test URL validation with empty value."""
        errors = validation_service.validate_value("", ["url"], "test_field")
        assert errors == []  # Should skip validation for empty values

    def test_validate_integer_success(self, validation_service):
        """Test integer validation with valid integer."""
        errors = validation_service.validate_value("123", ["integer"], "test_field")
        assert errors == []

    def test_validate_integer_float_string(self, validation_service):
        """Test integer validation with float string."""
        errors = validation_service.validate_value("123.0", ["integer"], "test_field")
        assert errors == []  # Should convert "123.0" to 123

    def test_validate_integer_invalid(self, validation_service):
        """Test integer validation with invalid value."""
        errors = validation_service.validate_value("abc", ["integer"], "test_field")
        assert len(errors) == 1
        assert "must be a valid integer" in errors[0]

    def test_validate_float_success(self, validation_service):
        """Test float validation with valid float."""
        errors = validation_service.validate_value("123.45", ["float"], "test_field")
        assert errors == []

    def test_validate_float_integer(self, validation_service):
        """Test float validation with integer."""
        errors = validation_service.validate_value("123", ["float"], "test_field")
        assert errors == []

    def test_validate_float_invalid(self, validation_service):
        """Test float validation with invalid value."""
        errors = validation_service.validate_value("abc", ["float"], "test_field")
        assert len(errors) == 1
        assert "must be a valid number" in errors[0]

    def test_validate_unique_placeholder(self, validation_service):
        """Test unique validation (placeholder)."""
        errors = validation_service.validate_value("test", ["unique"], "test_field")
        assert errors == []  # Should pass as it's a placeholder

    def test_validate_multiple_rules_success(self, validation_service):
        """Test multiple validation rules with valid value."""
        errors = validation_service.validate_value(
            "test@example.com", ["required", "email"], "test_field"
        )
        assert errors == []

    def test_validate_multiple_rules_failure(self, validation_service):
        """Test multiple validation rules with invalid value."""
        errors = validation_service.validate_value(
            "invalid-email", ["required", "email"], "test_field"
        )
        assert len(errors) == 1
        assert "must be a valid email address" in errors[0]

    def test_validate_unknown_rule(self, validation_service):
        """Test validation with unknown rule."""
        errors = validation_service.validate_value("test", ["unknown_rule"], "test_field")
        assert len(errors) == 1
        assert "Unknown validation rule: unknown_rule" in errors[0]

    def test_validate_empty_rules(self, validation_service):
        """Test validation with empty rules list."""
        errors = validation_service.validate_value("test", [], "test_field")
        assert errors == []

    def test_validate_with_whitespace_in_rules(self, validation_service):
        """Test validation with whitespace in rules."""
        errors = validation_service.validate_value("test", ["  required  "], "test_field")
        assert errors == []

    def test_validate_complex_scenario(self, validation_service):
        """Test complex validation scenario with multiple rules."""
        # Valid case
        errors = validation_service.validate_value(
            "test@example.com",
            ["required", "email", "max_length:50"],
            "email_field"
        )
        assert errors == []

        # Invalid case - too long email
        errors = validation_service.validate_value(
            "very_long_email_address_that_exceeds_the_maximum_length@example.com",
            ["required", "email", "max_length:50"],
            "email_field"
        )
        assert len(errors) == 1
        assert "must be no more than 50 characters long" in errors[0]

    def test_validate_numeric_edge_cases(self, validation_service):
        """Test numeric validation edge cases."""
        # Test with different numeric formats
        test_cases = [
            ("0", "positive_number", "must be a positive number"),
            ("0.0", "positive_number", "must be a positive number"),
            ("-1", "positive_number", "must be a positive number"),
            ("1", "positive_number", None),  # Should pass
            ("1.5", "positive_number", None),  # Should pass
            ("0", "non_negative_number", None),  # Should pass
            ("0.0", "non_negative_number", None),  # Should pass
            ("-1", "non_negative_number", "must be a non-negative number"),
        ]

        for value, rule, expected_error in test_cases:
            errors = validation_service.validate_value(value, [rule], "test_field")
            if expected_error:
                assert len(errors) == 1
                assert expected_error in errors[0]
            else:
                assert errors == []

    def test_validate_string_length_edge_cases(self, validation_service):
        """Test string length validation edge cases."""
        # Test with whitespace handling
        errors = validation_service.validate_value("  abc  ", ["min_length:3"], "test_field")
        assert errors == []  # Should strip whitespace and pass

        errors = validation_service.validate_value("  a  ", ["min_length:3"], "test_field")
        assert len(errors) == 1  # Should fail after stripping

        # Test with None and empty values
        errors = validation_service.validate_value(None, ["min_length:3"], "test_field")
        assert errors == []  # Should skip validation

        errors = validation_service.validate_value("", ["min_length:3"], "test_field")
        assert errors == []  # Should skip validation
