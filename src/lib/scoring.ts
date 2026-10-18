import type {Applicant,ExpenseKey,Grade,Match,Vehicle} from '../types';
export const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n||0);
export const percent=(n:number)=>(n*100).toFixed(1)+'%';
export const expenseFields: {key:ExpenseKey;label:string}[]=[{key:'rent',label:'Rent / Mortgage'},{key:'power',label:'Power'},{key:'water',label:'Water'},{key:'gas',label:'Gas'},{key:'insurance',label:'Insurance'},{key:'car',label:'Car Payment'},{key:'dependents',label:'Dependents'},{key:'creditCards',label:'Credit Cards'},{key:'loans',label:'Loans'},{key:'daycare',label:'Day Care'},{key:'otherBills',label:'Other Bills'}];
export const householdIncome=(a:Applicant)=>a.buyer.income+a.buyer.otherIncome+(a.coBuyer?.income||0)+(a.coBuyer?.otherIncome||0);
export const buyerIncome=(a:Applicant)=>a.buyer.income+a.buyer.otherIncome;
export const coIncome=(a:Applicant)=>(a.coBuyer?.income||0)+(a.coBuyer?.otherIncome||0);
export function expenses(a:Applicant){return expenseFields.reduce((sum,{key})=>{const x=a.buyer[key],y=a.coBuyer?.[key]||0;return sum+(a.review[key]==='shared'?Math.max(x,y):x+y);},0);}
export function combine(primary:Applicant,co?:Applicant):Applicant{
 if(!co)return primary;
 return {...primary,coBuyerName:co.name,coBuyer:{...co.buyer},cashDown:primary.cashDown+co.cashDown,verification:{buyerIncome:primary.verification.buyerIncome,coBuyerIncome:co.verification.buyerIncome},review:{...primary.review}};
}
export const workflows=['New','Working','Pending Docs','Appointment Set','Sold','Denied','Withdrawn','No Contact','Archived','Needs Review'] as const;
export const bucket=(s:string)=>s==='Archived'?'Archived':['Sold','Denied','Withdrawn','No Contact'].includes(s)?'Closed':'Active';
export const verified=(a:Applicant)=>a.verification.buyerIncome&&(!a.coBuyer||a.verification.coBuyerIncome);
export const gradeFor=(n:number):Grade=>n>=90?'A':n>=80?'B':n>=70?'C':n>=60?'D':'F';
export const gradeColor:Record<Grade,string>={A:'bg-emerald-600',B:'bg-goat-blue',C:'bg-amber-500',D:'bg-orange-600',F:'bg-goat-red'};
export const rules={mileage:[{min:200000,pts:3.5},{min:175000,pts:4.5},{min:150000,pts:5.5},{min:100000,pts:6.5},{min:0,pts:7.5}],risk:[{min:11000,pts:3.5},{min:10000,pts:4.5},{min:8750,pts:5.5},{min:7250,pts:6.5},{min:0,pts:7.5}],downDollar:[{min:2001,pts:7.5},{min:1601,pts:6.5},{min:1301,pts:5.5},{min:1001,pts:4.5},{min:0,pts:3.5}],downPct:[{min:.20,pts:7.5},{min:.16,pts:6.5},{min:.11,pts:5.5},{min:.06,pts:4.5},{min:0,pts:3.5}],paymentRatio:[{max:.15,pts:7.5},{max:.18,pts:6.5},{max:.22,pts:5.5},{max:.25,pts:4.5},{max:Infinity,pts:3.5}],veryLowRiskBonusThreshold:7249,veryLowRiskBonus:1};
const minBand=(value:number,bands:{min:number;pts:number}[])=>bands.find(b=>value>=b.min)!.pts;
const maxBand=(value:number,bands:{max:number;pts:number}[])=>bands.find(b=>value<=b.max)!.pts;
const rangePosition=(grade:Grade)=>({A:0,B:.25,C:.5,D:.75,F:1})[grade];
export function scoreVehicle(a:Applicant,v:Vehicle):Match{
 const income=householdIncome(a);
 const mileagePts=minBand(v.mileage,rules.mileage);
 const paymentRatio=income>0?v.payment/income:Infinity;
 const paymentPts=maxBand(paymentRatio,rules.paymentRatio);
 const available=a.cashDown;
 const calculate=(down:number)=>{
  const risk=Math.max(0,v.costExpenses-down);const riskPts=minBand(risk,rules.risk);
  const bonus=risk<=rules.veryLowRiskBonusThreshold?rules.veryLowRiskBonus:0;
  const downDollarPts=minBand(down,rules.downDollar);
  const downPct=v.costExpenses>0?down/v.costExpenses:0;
  const downPctPts=minBand(downPct,rules.downPct);
  const dealScore=mileagePts+riskPts+bonus+downDollarPts+downPctPts+paymentPts;
  const total=Number((a.stabilityScore+dealScore).toFixed(1));
  return {total,grade:gradeFor(total),dealScore,risk,riskPts,bonus,downDollarPts,downPct,downPctPts};
 };
 let down=v.downType==='FIXED'?v.downMin:Math.max(v.downMin,Math.min(available||v.downMin,v.downMax));
 let calculated=calculate(down);
 if(v.downType==='RANGE'){
  // Retain v9's one-pass down-payment adjustment. Final grade can shift after recalculation.
  down=Math.round((v.downMin+(v.downMax-v.downMin)*rangePosition(calculated.grade))/50)*50;
  calculated=calculate(down);
 }
 return {...calculated,requiredDown:down,mileagePts,paymentRatio,paymentPts,cashDelta:available-down};
}
