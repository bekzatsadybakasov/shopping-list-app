// Валидация dtoIn
function validateDtoIn(dtoIn, schema) {
  const errors = [];
  
  // Проверка обязательных полей
  if (schema.required) {
    schema.required.forEach(field => {
      if (!dtoIn[field] || (typeof dtoIn[field] === 'string' && dtoIn[field].trim().length === 0)) {
        errors.push(`${field} is required`);
      }
    });
  }
  
  // Проверка типов и ограничений
  if (schema.fields) {
    Object.keys(schema.fields).forEach(field => {
      const fieldSchema = schema.fields[field];
      const value = dtoIn[field];
      
      if (value !== undefined) {
        // Проверка типа
        if (fieldSchema.type && typeof value !== fieldSchema.type) {
          errors.push(`${field} must be of type ${fieldSchema.type}`);
        }
        
        // Проверка длины строки
        if (fieldSchema.type === 'string') {
          if (fieldSchema.min && value.length < fieldSchema.min) {
            errors.push(`${field} must be at least ${fieldSchema.min} characters`);
          }
          if (fieldSchema.max && value.length > fieldSchema.max) {
            errors.push(`${field} must be at most ${fieldSchema.max} characters`);
          }
        }
        
        // Проверка числовых значений
        if (fieldSchema.type === 'number') {
          if (fieldSchema.min !== undefined && value < fieldSchema.min) {
            errors.push(`${field} must be at least ${fieldSchema.min}`);
          }
          if (fieldSchema.max !== undefined && value > fieldSchema.max) {
            errors.push(`${field} must be at most ${fieldSchema.max}`);
          }
        }
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateDtoIn
};

