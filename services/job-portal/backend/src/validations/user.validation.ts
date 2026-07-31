import { body } from "express-validator";

export const submitKycSchema = [
  body("companyDocumentType")
    .trim()
    .notEmpty()
    .withMessage("Company document type is required"),

  body("personalDocumentType")
    .trim()
    .notEmpty()
    .withMessage("Personal document type is required"),
];

export const updateProfileSchema = [
  body('firstName').optional({ checkFalsy: true }).trim(),
  body('lastName').optional({ checkFalsy: true }).trim(),
  body('phone').optional({ checkFalsy: true }).trim(),
  body('location').optional({ checkFalsy: true }).isObject().withMessage('Location must be an object'),
  body('location.city').optional({ checkFalsy: true }).trim(),
  body('location.state').optional({ checkFalsy: true }).trim(),
  body('location.country').optional({ checkFalsy: true }).trim(),
  body('skills').optional({ checkFalsy: true }).isArray().withMessage('Skills must be an array'),
  body('skills.*').optional({ checkFalsy: true }).trim(),
  body('languages').optional({ checkFalsy: true }).isArray().withMessage('Languages must be an array'),
  body('languages.*').optional({ checkFalsy: true }).trim(),
  body('experience').optional().isArray().withMessage('Experience must be an array'),
  body('experience.*.title').optional().trim().notEmpty().withMessage('Experience title is required'),
  body('experience.*.company').optional().trim().notEmpty().withMessage('Experience company is required'),
  body('experience.*.workType').optional().isIn(['wfo', 'hybrid', 'remote', 'temporary_wfh']).withMessage('Invalid work type'),
  body('experience.*.location').custom((value, { req, path }) => {
    // Extract index from path (e.g., 'experience[0].location')
    const match = path.match(/\[(\d+)\]/);
    const index = match ? parseInt(match[1], 10) : null;
    if (index !== null && req.body.experience && req.body.experience[index]) {
      const workType = req.body.experience[index].workType;
      if (workType !== 'remote') {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          throw new Error('Experience location is required unless work type is remote');
        }
      }
    }
    return true;
  }),
  body('experience.*.startDate').optional().trim().notEmpty().withMessage('Experience start date is required'),
  body('experience.*.endDate').optional({ checkFalsy: true }).trim(),
  body('experience.*.current').optional().isBoolean().withMessage('Experience current must be a boolean'),
  body('experience.*.description').optional({ checkFalsy: true }).trim(),
  body('education').optional().isArray().withMessage('Education must be an array'),
  body('education.*.degree').optional().trim().notEmpty().withMessage('Education degree is required'),
  body('education.*.institution').optional().trim().notEmpty().withMessage('Education institution is required'),
  body('education.*.graduationYear').optional().trim().notEmpty().withMessage('Education graduation year is required'),
  body('education.*.fieldOfStudy').optional().trim().notEmpty().withMessage('Education field of study is required'),
];