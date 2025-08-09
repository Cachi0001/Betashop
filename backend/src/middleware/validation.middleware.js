const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    console.log('🔍 VALIDATION DEBUG - Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 VALIDATION DEBUG - Schema being used:', schema.describe());

    const { error, value } = schema.validate(req.body);

    if (error) {
      const errorMessage = error.details[0].message;
      console.log('❌ VALIDATION ERROR:', errorMessage);
      console.log('❌ VALIDATION ERROR DETAILS:', JSON.stringify(error.details, null, 2));
      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    }

    console.log('✅ VALIDATION SUCCESS - Validated data:', JSON.stringify(value, null, 2));
    next();
  };
};

const adminRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().required(),
  phone: Joi.string().required(),
  business_name: Joi.string().required(),
  business_type: Joi.string().required(),
  address: Joi.object().required(),
  bank_details: Joi.object({
    account_name: Joi.string().required(),
    account_number: Joi.string().required(),
    bank_name: Joi.string().required(),
    bank_code: Joi.string().required()
  }).optional()
});

const bankDetailsSchema = Joi.object({
  account_name: Joi.string().required(),
  account_number: Joi.string().required(),
  bank_name: Joi.string().required(),
  bank_code: Joi.string().required()
});

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('', null).optional(),
  category_id: Joi.string().uuid().required(),
  admin_price: Joi.number().positive().required(),
  stock_quantity: Joi.number().integer().min(0).required(),
  attributes: Joi.object().optional().default({}),
  images: Joi.array().items(Joi.string()).optional().default([]),
  location: Joi.object({
    street: Joi.string().allow('', null).optional(),
    city: Joi.string().allow('', null).optional(),
    state: Joi.string().allow('', null).optional(),
    country: Joi.string().optional().default('Nigeria')
  }).optional()
});

module.exports = {
  validate,
  adminRegistrationSchema,
  adminLoginSchema,
  productSchema,
  bankDetailsSchema
};

