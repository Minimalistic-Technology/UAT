export const buildBaseJobQuery = (
  queryParams: Record<string, any>,
  isJob: boolean = true
): Record<string, any> => {
  const { search, employmentType, jobType, skills, city, state, country, workMode } =
    queryParams;

  const query: any = {
    status: "ACTIVE",
    isDeleted: false,
  };

  const typeParam = employmentType || jobType;
  if (typeParam && typeParam !== "all") {
    const typeArray = Array.isArray(typeParam) ? typeParam : typeParam.split(",");
    query.employmentType = { in: typeArray.map((t: string) => t.toUpperCase().replace(/-/g, "_")) };
  }

  if (workMode && workMode !== "all") {
    const workModeArray = Array.isArray(workMode) ? workMode : workMode.split(",");
    query.workMode = { in: workModeArray.map((w: string) => w.toUpperCase().replace(/ /g, "_")) };
  } else if (queryParams.remote === "true" || queryParams.remote === true) {
    query.workMode = { in: ["REMOTE", "TEMPORARY_WFH"] };
  }

  const { roleCategory, companyType } = queryParams;

  if (roleCategory) {
    const roleCategoryArray = Array.isArray(roleCategory) ? roleCategory : roleCategory.split(",");
    if (roleCategoryArray.length > 0) {
      query.roleCategory = { in: roleCategoryArray.map((r: string) => r.toUpperCase().replace(/-/g, "_")) };
    }
  }

  if (companyType) {
    const companyTypeArray = Array.isArray(companyType) ? companyType : companyType.split(",");
    if (companyTypeArray.length > 0) {
      query.companyType = { in: companyTypeArray.map((c: string) => c.toUpperCase().replace(/-/g, "_")) };
    }
  }

  if (search && typeof search === "string") {
    query.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { skills: { hasSome: [search] } },
    ];
  }

  if (skills) {
    const skillArray = Array.isArray(skills) ? skills : [skills];
    if (skillArray.length > 0) {
      if (query.OR) {
        query.AND = [
          { OR: query.OR },
          { skills: { hasSome: skillArray } }
        ];
        delete query.OR;
      } else {
        query.skills = { hasSome: skillArray };
      }
    }
  }

  if (isJob && queryParams.experienceRanges) {
    const experienceRangesArray = Array.isArray(queryParams.experienceRanges)
      ? queryParams.experienceRanges
      : queryParams.experienceRanges.split(",");

    const validRanges = experienceRangesArray.filter((r: string) => r && r.trim() !== "");

    if (validRanges.length > 0) {
      const expConditions = validRanges.map((range: string) => {
        const parts = range.split("-");
        const min = parseInt(parts[0]) || 0;
        const max = parseInt(parts[1]) || 20;
        return { experienceInYears: { gte: min, lte: max } };
      });

      if (!query.jobDetails) query.jobDetails = { is: {} };
      query.jobDetails.is.OR = expConditions;
    }
  }

  if (city) query.city = { contains: city, mode: "insensitive" };
  if (state) query.state = { contains: state, mode: "insensitive" };
  if (country) query.country = { contains: country, mode: "insensitive" };

  return query;
};