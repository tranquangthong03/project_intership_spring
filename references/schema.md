# Schema Reference

## CandidateProfile

```json
{
  "fullName": "string | null",
  "email": "string | null",
  "phone": "string | null",
  "location": "string | null",
  "summary": "string | null",
  "yearsOfExperience": 0,
  "roles": [],
  "skills": [],
  "education": [],
  "projects": [],
  "rawText": "string"
}

{
  "id": "string",
  "source": "itviec",
  "title": "string",
  "company": "string",
  "location": "string | null",
  "workMode": "onsite | hybrid | remote | unknown",
  "seniority": "intern | fresher | junior | middle | senior | lead | unknown",
  "salaryMin": null,
  "salaryMax": null,
  "currency": "VND | USD | null",
  "skills": [],
  "roleKeywords": [],
  "description": "string",
  "url": "string"
}
{
  "jobId": "string",
  "title": "string",
  "company": "string",
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "experienceFit": "low | medium | high",
  "roleFit": "low | medium | high",
  "reasoning": "string",
  "recommendation": "apply | consider | low-fit"
}
{
  "jobId": "string",
  "title": "string",
  "company": "string",
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "experienceFit": "low | medium | high",
  "roleFit": "low | medium | high",
  "reasoning": "string",
  "recommendation": "apply | consider | low-fit"
}