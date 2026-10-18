export type Workflow = 'New'|'Working'|'Pending Docs'|'Appointment Set'|'Sold'|'Denied'|'Withdrawn'|'No Contact'|'Archived'|'Needs Review';
export type ExpenseKey = 'rent'|'car'|'power'|'water'|'gas'|'insurance'|'dependents'|'creditCards'|'loans'|'daycare'|'otherBills';
export type Person = {income:number;otherIncome:number}&Record<ExpenseKey,number>;
export type Applicant = {id:number;name:string;coBuyerName:string|null;status:Workflow;stabilityScore:number;cashDown:number;buyer:Person;coBuyer:Person|null;review:Partial<Record<ExpenseKey,'shared'|'both'>>;verification:{buyerIncome:boolean;coBuyerIncome:boolean};created:string};
export type InventoryType = 'REGULAR'|'BUDGET'|'PREMIUM BUDGET';
export type Vehicle = {id:number;stock:string;year:number;make:string;model:string;mileage:number;status:'COMING SOON'|'AVAILABLE'|'SOLD';type:InventoryType;costExpenses:number;downType:'RANGE'|'FIXED';downMin:number;downMax:number;payment:number;price:number};
export type Grade = 'A'|'B'|'C'|'D'|'F';
export type Match = {total:number;grade:Grade;dealScore:number;requiredDown:number;mileagePts:number;risk:number;riskPts:number;bonus:number;downDollarPts:number;downPct:number;downPctPts:number;paymentRatio:number;paymentPts:number;cashDelta:number};
