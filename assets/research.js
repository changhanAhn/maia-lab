/* Shared research content. Map state belongs to map.html, not this object. */
(function(){
const ST={sub:['투고','Submitted','#9fb8d0'],rev:['심사 중','In review','#c9a96e'],fix:['수정 중','Revising','#b4b1aa'],pre:['사전등록','Pre-registered','#8fae9a'],run:['운영 중','In use','#8fae9a'],dev:['진행 중','In progress','#b4b1aa'],win:['수상','Award','#b9a37a'],open:['공개','Open','#9fb8d0']};
const TR=[
  {id:'A',c:'#b9a37a',ko:'AI 적용성',en:'AI applicability',q:[['작업별','AI·사람 배분'],['Task allocation','between AI and people']],
   wko:'작업마다 점수와 관문으로 AI·협업·사람을 가립니다.',wen:'Scores and gates decide AI, together, or a person for each task.',
   leaves:[['MAIA 적용성 지수','MAIA applicability index','fix'],['비보상 관문 계약','Non-compensatory gate contract','rev'],['MAIA 진단 체험','Try the MAIA check','open','maia.html']],short:[['MAIA 지수','MAIA index'],['비보상 관문','Gate contract'],['MAIA 진단','MAIA check']]},
  {id:'B',c:'#a3b5c6',ko:'제조·피지컬 AI',en:'Physical AI',q:[['현장 AI 판정의','안전 확보'],['Safe AI decisions','on the shop floor']],
   wko:'AI는 판정만 하고, 제어는 PLC가 맡는 구조를 실제 라인에서 시험합니다.',wen:'AI only judges and the PLC keeps control — tested on a real line.',
   leaves:[['인라인 검사: 차단 경로와 PLC 관측 지연','Inline inspection: fail-closed routing and PLC-observed latency','sub'],['고정 검사의 반복 정밀도','Precision of a frozen inspection procedure','rev'],['래더 프로그램 적합성 검사','Ladder-program conformance checking','pre'],['코인셀 MPS 시험 라인','Coin-cell MPS test line','run']],short:[['인라인 검사','Inline inspection'],['반복 정밀도','Repeat precision'],['래더 적합성','Ladder conformance'],['코인셀 시험 라인','Coin-cell test line']]},
  {id:'D',c:'#b0a690',ko:'에너지×제조',en:'Energy × mfg',q:[['전력과 품질의','동시 분석'],['Joint analysis of','power and quality']],
   wko:'공정 이벤트와 전력을 동기화해 분석하는 연구 절차를 설계합니다.',wen:'We design a procedure to align process events and power records for analysis.',
   leaves:[['공정 이벤트 동기 전력 분해','Event-synchronized power disaggregation','dev']],short:[['공정 동기 전력 분해','Event-synced power']]},
  {id:'C',c:'#b9976a',ko:'에너지·계통',en:'Energy & grid',q:[['전력 제약 하의','의사결정'],['Decisions under','power constraints']],
   wko:'요금 구간 제어와 순간 보호를 나눠 공장 마이크로그리드를 운영합니다.',wen:'Billing-window control and instant protection, kept in separate layers.',
   leaves:[['로봇 공장 마이크로그리드 계층형 에너지 관리','Hierarchical energy management for a robotic factory microgrid','rev'],['PV·ESS·라인 부하 트윈','PV · storage · line-load twin','dev'],['엣지 AI 부하 전력 계측','Edge-AI load power measurement','dev']],short:[['마이크로그리드 EMS','Microgrid EMS'],['PV·ESS 트윈','PV·ESS twin'],['엣지 AI 부하','Edge-AI load']]},
  {id:'E',c:'#8fae9a',ko:'교육·기술이전',en:'Education',q:[['판단 기준의','교육·이전'],['Teaching and','transferring the rules']],
   wko:'검증된 방법을 수업과 실습으로 옮깁니다.',wen:'We turn verified methods into courses and hands-on work.',
   leaves:[['비전공자 PLC·비전·데이터 실습','Hands-on PLC, vision and data for non-majors','run'],['학생 포트폴리오','Student portfolios','run'],['재직자·직업계고 PLC 교육(중소벤처기업진흥공단)','PLC training for workers and vocational students (KOSME)','run']],short:[['비전공 실습','Hands-on courses'],['학생 포트폴리오','Student portfolios'],['재직자 교육','Industry training']]}
];


const EXTRA={
  "A": {
    "href": "research-ai.html",
    "steps": [
      [
        "작업·자료",
        "Task and evidence"
      ],
      [
        "8문항·관문 2개",
        "Eight questions · two gates"
      ],
      [
        "AI·협업·사람 배분",
        "AI · collaboration · person"
      ]
    ],
    "limit": [
      "계획용 진단입니다. 점수와 관문 결과는 실설비 실행 권한이 아닙니다.",
      "This is a planning check. Scores and gates do not grant permission to operate equipment."
    ],
    "links": [
      "record.html#maia-index",
      "record.html#hari",
      "maia.html"
    ],
    "action": [
      "maia.html",
      "MAIA 진단 →",
      "MAIA check →"
    ]
  },
  "B": {
    "href": "research-manufacturing.html",
    "steps": [
      [
        "프레임·설비 기록",
        "Frames and equipment logs"
      ],
      [
        "판정·상태·증거 대조",
        "Compare decisions, states and evidence"
      ],
      [
        "검사·제어 경계 확인",
        "Check inspection–control boundaries"
      ]
    ],
    "limit": [
      "공개 결과는 해당 시험 조건에 한정됩니다. PB2 운전정지와 하드웨어 비상정지는 구분합니다.",
      "Public results apply to their test conditions. PB2 operational stop is distinct from a hardware emergency stop."
    ],
    "links": [
      "record.html#inline",
      "record.html#repeat",
      "record.html#ladder",
      null
    ],
    "action": [
      "data.html",
      "공개 자료 →",
      "Open resources →"
    ]
  },
  "C": {
    "href": "research-energy.html",
    "steps": [
      [
        "요금·부하·PV·ESS",
        "Tariffs · load · PV · ESS"
      ],
      [
        "요금 구간 계획·순간 보호",
        "Billing-window planning · instant protection"
      ],
      [
        "전력 제약 충족 확인",
        "Check power constraints"
      ]
    ],
    "limit": [
      "트윈은 연구·시뮬레이션용입니다. 현장 절감 효과는 실측 검증 대상입니다.",
      "The twin is for research and simulation. On-site savings require measurement-based validation."
    ],
    "links": [
      "record.html#energy",
      null,
      null
    ],
    "action": [
      "work.html",
      "연구 문의 →",
      "Discuss this research →"
    ]
  },
  "D": {
    "href": "research-energy-manufacturing.html",
    "steps": [
      [
        "공정 이벤트·전력 기록",
        "Process events and power records"
      ],
      [
        "시각 정렬·공정별 분해",
        "Align time and disaggregate by process"
      ],
      [
        "전력·품질 관계 검토",
        "Examine power–quality relationships"
      ]
    ],
    "limit": [
      "2026-10-21 기준, 설계 동결 · 전력 실측 0. 도식은 미측정 연구 설계입니다.",
      "As of 2026-10-21: design frozen, no power measurements. This is an unmeasured research design."
    ],
    "links": [
      null
    ],
    "action": [
      "work.html",
      "연구 문의 →",
      "Discuss this research →"
    ]
  },
  "E": {
    "href": "research-education.html",
    "steps": [
      [
        "학습목표·공개 자료",
        "Learning goals and open resources"
      ],
      [
        "실습·기록·재현",
        "Practice, record and reproduce"
      ],
      [
        "학습 산출물 평가",
        "Assess learning outputs"
      ]
    ],
    "limit": [
      "수업·실습과 대외 교육 사례입니다. 학습 산출물은 설비 성능의 증거와 구분합니다.",
      "These are teaching, practice and outside training cases. Learning outputs are distinct from evidence of equipment performance."
    ],
    "links": [
      null,
      null,
      null
    ],
    "action": [
      "data.html",
      "공개 자료 →",
      "Open resources →"
    ]
  }
};
TR.forEach(t=>Object.assign(t,EXTRA[t.id]));
function freeze(x){Object.values(x).forEach(v=>{if(v&&typeof v==='object')freeze(v)});return Object.freeze(x)}
window.RESEARCH=freeze({statuses:ST,areas:TR});
})();
