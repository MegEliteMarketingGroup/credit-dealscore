import type {Applicant,Vehicle,Person} from '../types';
const person=(data:Partial<Person>):Person=>({income:0,otherIncome:0,rent:0,car:0,power:0,water:0,gas:0,insurance:0,dependents:0,creditCards:0,loans:0,daycare:0,otherBills:0,...data});
export const initialApplicants:Applicant[]=[
{id:1,name:'Summer Chadwick',coBuyerName:'Bradley Chadwick',status:'Working',stabilityScore:62.5,cashDown:1300,buyer:person({income:4000,car:700,power:150,water:60,gas:120,insurance:165,dependents:800,otherBills:50}),coBuyer:person({income:650,otherIncome:400}),review:{rent:'shared',power:'shared',water:'shared',gas:'shared'},verification:{buyerIncome:true,coBuyerIncome:true},created:'2026-10-01'},
{id:2,name:'Jane Smith',coBuyerName:null,status:'New',stabilityScore:58.5,cashDown:2500,buyer:person({income:4400,otherIncome:200,rent:950,power:160,water:55,insurance:190,dependents:400,creditCards:90,otherBills:65}),coBuyer:null,review:{},verification:{buyerIncome:false,coBuyerIncome:false},created:'2026-10-02'},
{id:3,name:'Marcus Green',coBuyerName:null,status:'Needs Review',stabilityScore:46,cashDown:900,buyer:person({income:3100,rent:800,car:350,power:180,water:60,gas:70,insurance:145,dependents:800,creditCards:120,loans:100,otherBills:80}),coBuyer:null,review:{},verification:{buyerIncome:false,coBuyerIncome:false},created:'2026-10-02'},
{id:4,name:'Bradley Chadwick',coBuyerName:null,status:'New',stabilityScore:51.5,cashDown:0,buyer:person({income:650,otherIncome:400}),coBuyer:null,review:{},verification:{buyerIncome:false,coBuyerIncome:false},created:'2026-10-01'}
];
export const initialVehicles:Vehicle[]=[
{id:101,stock:'13392',year:2016,make:'Chevrolet',model:'Tahoe',mileage:138400,status:'COMING SOON',type:'REGULAR',costExpenses:13538.58,downType:'RANGE',downMin:3000,downMax:4000,payment:625,price:27900},
{id:102,stock:'14192',year:2018,make:'Chevrolet',model:'Malibu',mileage:98000,status:'AVAILABLE',type:'REGULAR',costExpenses:7800,downType:'RANGE',downMin:1500,downMax:2500,payment:475,price:16900},
{id:103,stock:'14218',year:2017,make:'Ford',model:'Escape',mileage:124000,status:'AVAILABLE',type:'REGULAR',costExpenses:9200,downType:'RANGE',downMin:1800,downMax:2800,payment:525,price:19900},
{id:104,stock:'BB211',year:2012,make:'Nissan',model:'Altima',mileage:171500,status:'AVAILABLE',type:'BUDGET',costExpenses:5100,downType:'FIXED',downMin:500,downMax:500,payment:350,price:8995},
{id:105,stock:'PBB32',year:2014,make:'Honda',model:'Accord',mileage:151200,status:'AVAILABLE',type:'PREMIUM BUDGET',costExpenses:6200,downType:'FIXED',downMin:800,downMax:800,payment:395,price:10995}
];
