from app.schemas.products import ColumnConfig, ValidationRule


class TestValidationRule:
    """Test cases for ValidationRule class."""

    def test_parse_simple_rule(self):
        """Test parsing a simple validation rule without parameters."""
        rule = ValidationRule.parse("required")
        assert rule.rule == "required"
        assert rule.params == {}

    def test_parse_rule_with_parameter(self):
        """Test parsing a validation rule with a numeric parameter."""
        rule = ValidationRule.parse("min_length:5")
        assert rule.rule == "min_length"
        assert rule.params == {"value": 5}

    def test_parse_rule_with_string_parameter(self):
        """Test parsing a validation rule with a string parameter."""
        rule = ValidationRule.parse("custom_rule:some_value")
        assert rule.rule == "custom_rule"
        assert rule.params == {"value": "some_value"}

    def test_parse_rule_with_whitespace(self):
        """Test parsing a validation rule with whitespace."""
        rule = ValidationRule.parse("  required  ")
        assert rule.rule == "required"
        assert rule.params == {}

    def test_parse_rule_with_parameter_whitespace(self):
        """Test parsing a validation rule with parameter and whitespace."""
        rule = ValidationRule.parse("  min_length:  10  ")
        assert rule.rule == "min_length"
        assert rule.params == {"value": 10}

    def test_parse_rule_with_float_parameter(self):
        """Test parsing a validation rule with a float parameter."""
        rule = ValidationRule.parse("max_value:10.5")
        assert rule.rule == "max_value"
        assert rule.params == {"value": "10.5"}  # Should remain as string

    def test_parse_rule_with_zero_parameter(self):
        """Test parsing a validation rule with zero parameter."""
        rule = ValidationRule.parse("min_length:0")
        assert rule.rule == "min_length"
        assert rule.params == {"value": 0}

    def test_parse_rule_with_negative_parameter(self):
        """Test parsing a validation rule with negative parameter."""
        rule = ValidationRule.parse("offset:-5")
        assert rule.rule == "offset"
        assert rule.params == {"value": -5}


class TestColumnConfigValidationRules:
    """Test cases for ColumnConfig validation_rules property."""

    def test_validation_rules_simple(self):
        """Test validation_rules property with simple validation."""
        config = ColumnConfig(
            column="test",
            validation="required",
            db_field="test_field"
        )
        rules = config.validation_rules
        assert len(rules) == 1
        assert rules[0].rule == "required"
        assert rules[0].params == {}

    def test_validation_rules_multiple(self):
        """Test validation_rules property with multiple validations."""
        config = ColumnConfig(
            column="test",
            validation="required,email,max_length:100",
            db_field="test_field"
        )
        rules = config.validation_rules
        assert len(rules) == 3
        assert rules[0].rule == "required"
        assert rules[0].params == {}
        assert rules[1].rule == "email"
        assert rules[1].params == {}
        assert rules[2].rule == "max_length"
        assert rules[2].params == {"value": 100}

    def test_validation_rules_with_whitespace(self):
        """Test validation_rules property with whitespace in validation string."""
        config = ColumnConfig(
            column="test",
            validation="  required  ,  email  ,  max_length:  50  ",
            db_field="test_field"
        )
        rules = config.validation_rules
        assert len(rules) == 3
        assert rules[0].rule == "required"
        assert rules[1].rule == "email"
        assert rules[2].rule == "max_length"
        assert rules[2].params == {"value": 50}

    def test_validation_rules_empty(self):
        """Test validation_rules property with empty validation."""
        config = ColumnConfig(
            column="test",
            validation="",
            db_field="test_field"
        )
        rules = config.validation_rules
        assert len(rules) == 0

    def test_validation_rules_whitespace_only(self):
        """Test validation_rules property with whitespace-only validation."""
        config = ColumnConfig(
            column="test",
            validation="   ",
            db_field="test_field"
        )
        rules = config.validation_rules
        assert len(rules) == 0

    def test_validation_rules_complex_scenario(self):
        """Test validation_rules property with complex validation scenario."""
        config = ColumnConfig(
            column="email",
            validation="required,email,max_length:255,min_length:5",
            db_field="email_field"
        )
        rules = config.validation_rules
        assert len(rules) == 4

        # Check all rules are parsed correctly
        expected_rules = [
            ("required", {}),
            ("email", {}),
            ("max_length", {"value": 255}),
            ("min_length", {"value": 5})
        ]

        for i, (expected_rule, expected_params) in enumerate(expected_rules):
            assert rules[i].rule == expected_rule
            assert rules[i].params == expected_params

    def test_validation_rules_mixed_types(self):
        """Test validation_rules property with mixed parameter types."""
        config = ColumnConfig(
            column="test",
            validation="required,min_length:10,max_value:100.5,custom_rule:test_value",
            db_field="test_field"
        )
        rules = config.validation_rules
        assert len(rules) == 4

        # Check parameter types are preserved correctly
        assert rules[1].params == {"value": 10}  # Integer
        assert rules[2].params == {"value": "100.5"}  # String (not converted to float)
        assert rules[3].params == {"value": "test_value"}  # String

    def test_validation_rules_edge_cases(self):
        """Test validation_rules property with edge cases."""
        # Test with single comma
        config = ColumnConfig(
            column="test",
            validation=",",
            db_field="test_field"
        )
        rules = config.validation_rules
        assert len(rules) == 0  # Should ignore empty rules

        # Test with multiple commas
        config = ColumnConfig(
            column="test",
            validation="required,,email",
            db_field="test_field"
        )
        rules = config.validation_rules
        assert len(rules) == 2  # Should ignore empty rule in middle
        assert rules[0].rule == "required"
        assert rules[1].rule == "email"

        # Test with trailing comma
        config = ColumnConfig(
            column="test",
            validation="required,email,",
            db_field="test_field"
        )
        rules = config.validation_rules
        assert len(rules) == 2  # Should ignore trailing empty rule
        assert rules[0].rule == "required"
        assert rules[1].rule == "email"
