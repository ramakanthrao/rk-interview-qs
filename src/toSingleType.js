/**
 * Array.prototype.toSingleType
 * Converts a mixed-type array into a single-type array based on priority rules.
 * 
 * Priority: array > object > (primitives based on conditions)
 * 
 * Usage:
 *   const result = [1, "No", true].toSingleType();
 *   console.log(result);           // [true, false, true]
 *   console.log(result.getType()); // 'boolean'
 *   console.log(result.getSchema()); // JSON Schema
 */

/**
 * Convert a value to the target type
 */
function convertTo(value, targetType, objectKey = 'value') {
    switch (targetType) {
        case 'boolean':
            // Semantic boolean conversion
            if (typeof value === 'string') {
                const lower = value.toLowerCase().trim();
                if (['no', 'false', '0', ''].includes(lower)) return false;
                if (['yes', 'true', '1'].includes(lower)) return true;
            }
            return Boolean(value);

        case 'number':
            if (typeof value === 'boolean') return value ? 1 : 0;
            if (typeof value === 'number') return value;
            return Number(value) || 0;

        case 'string':
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value);

        case 'object':
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                // Convert existing object to use the common key
                const existingValue = Object.values(value)[0];
                return { [objectKey]: existingValue };
            }
            return { [objectKey]: String(value).toLowerCase() };

        case 'array':
            if (Array.isArray(value)) return value;
            if (typeof value === 'boolean') return [value ? 1 : 0];
            return [value];

        default:
            return value;
    }
}

/**
 * Array prototype function to convert mixed-type arrays to a single type
 */
Array.prototype.toSingleType = function () {
    if (this.length === 0) {
        const result = [];
        result.getType = () => 'undefined';
        result.getSchema = () => ({
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "array",
            "items": {}
        });
        return result;
    }

    // Check for presence of types and specific values
    let hasArray = false;
    let hasObject = false;
    let hasBoolean = false;
    let hasNumber = false;
    let hasNumberGreaterThan1 = false;
    let hasString = false;
    let hasYesNo = false;

    for (const item of this) {
        if (Array.isArray(item)) {
            hasArray = true;
        } else if (item !== null && typeof item === 'object') {
            hasObject = true;
        } else if (typeof item === 'boolean') {
            hasBoolean = true;
        } else if (typeof item === 'number') {
            hasNumber = true;
            if (item > 1) hasNumberGreaterThan1 = true;
        } else if (typeof item === 'string') {
            hasString = true;
            const lower = item.toLowerCase().trim();
            if (lower === 'yes' || lower === 'no') hasYesNo = true;
        }
    }

    // Determine dominant type based on rules
    let dominantType;

    if (hasArray) {
        dominantType = 'array';
    } else if (hasObject) {
        dominantType = 'object';
    } else if (hasString && !hasBoolean && !hasNumber) {
        // Only strings, no boolean or number
        dominantType = 'string';
    } else if (hasYesNo && hasBoolean && !hasNumberGreaterThan1) {
        // Has "Yes"/"No" + boolean + no number > 1 → boolean
        dominantType = 'boolean';
    } else if (hasYesNo && hasBoolean && hasNumberGreaterThan1) {
        // Has "Yes"/"No" + boolean + number > 1 → number
        dominantType = 'number';
    } else if (hasNumberGreaterThan1 && hasYesNo && hasBoolean) {
        // Has number > 1 + "Yes"/"No" + boolean → number
        dominantType = 'number';
    } else if (hasNumber && !hasBoolean && !hasString) {
        // Only numbers
        dominantType = 'number';
    } else if (hasBoolean && !hasNumber && !hasString) {
        // Only booleans
        dominantType = 'boolean';
    } else if (hasNumberGreaterThan1) {
        // Has number > 1 with mixed types → number
        dominantType = 'number';
    } else if (hasBoolean) {
        // Has boolean (with 0/1 numbers or strings) → boolean
        dominantType = 'boolean';
    } else {
        // Default to string
        dominantType = 'string';
    }

    // Convert all elements to the dominant type
    // For object type, find the key from existing objects
    let objectKey = 'value'; // default key
    if (dominantType === 'object') {
        for (const item of this) {
            if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
                const keys = Object.keys(item);
                if (keys.length > 0) {
                    objectKey = keys[0]; // Use the first key from the first object found
                    break;
                }
            }
        }
    }
    
    const result = this.map(item => convertTo(item, dominantType, objectKey));
    
    // Generate JSON Schema based on converted type and actual data
    const generateSchema = (type, data) => {
        const baseSchema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "array",
            "items": {}
        };
        
        switch (type) {
            case 'boolean':
                baseSchema.items = { "type": "boolean" };
                break;
            case 'number':
                baseSchema.items = { "type": "number" };
                break;
            case 'string':
                baseSchema.items = { "type": "string" };
                break;
            case 'object':
                // Dynamically extract properties from all objects
                const properties = {};
                for (const item of data) {
                    if (item && typeof item === 'object' && !Array.isArray(item)) {
                        for (const key of Object.keys(item)) {
                            if (!properties[key]) {
                                const val = item[key];
                                properties[key] = { "type": typeof val === 'number' ? 'number' : 'string' };
                            }
                        }
                    }
                }
                baseSchema.items = {
                    "type": "object",
                    "properties": properties
                };
                break;
            case 'array':
                baseSchema.items = { "type": "array" };
                break;
            default:
                baseSchema.items = {};
        }
        
        return baseSchema;
    };
    
    result.getType = () => dominantType;
    result.getSchema = () => generateSchema(dominantType, result);

    return result;
};

// Export for Node.js (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { convertTo };
}
