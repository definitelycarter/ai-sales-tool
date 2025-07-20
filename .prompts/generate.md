Please generate an of 100 accounts as json with the following fields:

- `id`: (number) must be unique between 1-100 (primary key).
- `account_name`: (string) The account name. Please fill this in with various names of a company that you might find from google.
- `next_best_action_status`: (string) must be active, snoozed, rejected. Make 1% snoozed and 1% rejected.
- `next_best_action_created_at`: (date) any date within the last two weeks.
- `snoozed_on`: (string) if the `next_best_action_status` is snoozed, make this a date that falls within this week.
- `snoozed_reason`: (string) if the `next_best_action_status` is snoozed, make this a reasonable reason why this account was rejected.
- `rejected_on`: (string) if the `next_best_action_status` is rejected, make this a date that falls within this week.
- `rejected_reason`: (string) if the `next_best_action_status` is rejected, make this a reasonable reason why this account was rejected.
- `product_recommendation1`: (string) mutually exclusive with `product_recommendation2`. Can be either `HR-Pro upgrade`, `HRO-PEO`, `Health and Benefits`, `INS - Workers Compensation`, `Retirement Services - 401k`, `Retirement Services - Simple IRA`, `TLM`.
- `product_recommendation2`: (string) mutually exclusive with `product_recommendation1`. Can be either `HR-Pro upgrade`, `HRO-PEO`, `Health and Benefits`, `INS - Workers Compensation`, `Retirement Services - 401k`, `Retirement Services - Simple IRA`, `TLM`.
- `triggers`: (array of strings). Valid values `eeCountActiveW2Hire30Days`, `eeCountTermedW2Hire30Days`, `garnishedEECount30Days`, `hasSpecialPayroll7Days`, `payrollContactUpdated7Days`. Generate an array between 1 and 4 elements. each element must be unique.
- `product_classification` (string) valid values are `Gold`, `Silver`, `Bronze`. 4 triggers should be `Gold`, 3 triggers should be `Silver`, if `product_recommendation1` or `product_recommendation2` is `HRO-PEO` then `product_classification` must be `Gold`. All others are `Bronze`.
- `nba_type`: (string) valid values are `Monday Morning List`, `Highly-Scored PEO`, `Referral`. 10% `Referral` and if `product_recommendation1` or `product_recommendation` is `HRO-PEO` then `Highly-Scored PEO`. The rest should be `Monday Morning List`.
- `contacts`: (array of objects) either 1 or 2 contacts that has a `contact_name` (string), `email` (string), and `phone_number` (string) that is 10 digits.
- `private_notes`: (array of objects) the object has a `created_at` (date), and a `content` (string). Only add a private note to one account with a `created_at` of 9 months ago and the `content` stating that one of the `contacts` is out on P.T.O. expecting to have a baby girl and will return on {today's date}. Use the `contacts` `contact_name`
