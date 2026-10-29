/* Where each project stands, for the development page. Only facts and dates already shown
   on the record and data pages (submission and deposit dates); portal-only dates are not
   published. leaf = [research area, output index] in research.js and st its status there;
   rec = the row id on record.html. tools/check_pages.py fails when any of them disagree.
   Step state: done, now (where the project stands) or next. Names: ko, en, ja, zh.
   DATA is plain JSON so tools/publish_public.py can write the same rows into the page. */
(function(){
const DATA=
{
  "steps": {
    "prereg": ["사전등록", "Pre-registered", "事前登録", "预注册"],
    "line": ["라인 실측", "Line measurement", "ライン実測", "产线实测"],
    "data": ["데이터 공개", "Data released", "データ公開", "数据公开"],
    "sub": ["투고", "Submitted", "投稿", "投稿"],
    "review": ["심사 중", "In review", "査読中", "审稿中"],
    "received": ["접수", "Received", "受付", "已受理"],
    "revise": ["수정 중", "Revising", "修正中", "修改中"],
    "prepare": ["투고 준비", "Preparing submission", "投稿準備", "准备投稿"],
    "design": ["설계", "Design", "設計", "设计"],
    "measure": ["실측", "Measurement", "実測", "实测"],
    "dev": ["진행 중", "In progress", "進行中", "进行中"],
    "run": ["운영 중", "In use", "運用中", "运行中"]
  },
  "projects": [
    {"leaf": ["B", 0], "st": "rev", "rec": "inline", "name": ["인라인 검사 엔진", "Inline inspection engine", "インライン検査エンジン", "在线检测引擎"],
     "steps": [["line", "2026-10-15", "done"], ["data", "2026-10-15", "done"], ["sub", "2026-10-15", "done"], ["review", "", "now"]]},
    {"leaf": ["B", 1], "st": "sub", "rec": "repeat", "name": ["반복 검사 정밀도", "Repeat-inspection precision", "繰り返し検査の精度", "重复检测精度"],
     "steps": [["data", "2026-10-11", "done"], ["sub", "2026-10-25", "done"], ["received", "", "now"]]},
    {"leaf": ["B", 2], "st": "rev", "rec": "ladder", "name": ["래더 적합성 검사", "Ladder conformance checking", "ラダー適合性検査", "梯形图符合性检查"],
     "steps": [["prereg", "", "done"], ["line", "2026-10-17", "done"], ["data", "2026-10-17", "done"], ["sub", "2026-10-26", "done"], ["review", "", "now"]]},
    {"leaf": ["A", 0], "st": "fix", "rec": "maia-index", "name": ["MAIA 적용성 지수", "MAIA applicability index", "MAIA適用性指数", "MAIA适用性指数"],
     "steps": [["sub", "2026-09-19", "done"], ["revise", "", "now"]]},
    {"leaf": ["A", 1], "st": "sub", "rec": "hari", "name": ["비보상 관문 계약", "Non-compensatory gate contract", "非補償ゲート契約", "非补偿门控契约"],
     "steps": [["sub", "2026-09-20", "done"], ["received", "", "now"]]},
    {"leaf": ["C", 0], "st": "rev", "rec": "energy", "name": ["마이크로그리드 계층형 에너지 관리", "Microgrid energy management", "マイクログリッドの階層型エネルギー管理", "微电网分层能量管理"],
     "steps": [["sub", "2026-09-25", "done"], ["review", "", "now"]]},
    {"leaf": ["D", 0], "st": "dev", "name": ["공정 이벤트 동기 전력 분해", "Power split by process event", "工程イベント同期の電力分解", "工序事件同步的电力分解"],
     "steps": [["design", "", "now"], ["measure", "", "next"]]},
    {"leaf": ["C", 1], "st": "dev", "name": ["PV·ESS·라인 부하 트윈", "PV · storage · line-load twin", "PV・ESS・ライン負荷ツイン", "PV·ESS·产线负荷孪生"],
     "steps": [["dev", "", "now"]]},
    {"leaf": ["C", 2], "st": "dev", "name": ["엣지 AI 부하 전력 계측", "Edge-AI load power measurement", "エッジAI負荷の電力計測", "边缘AI负荷电力测量"],
     "steps": [["dev", "", "now"]]},
    {"leaf": ["B", 3], "st": "run", "name": ["코인셀 시험 라인", "Coin-cell test line", "コインセル試験ライン", "纽扣电池试验线"],
     "steps": [["run", "", "now"]]},
    {"leaf": ["E", 0], "st": "run", "name": ["비전공자 PLC·비전·데이터 실습", "PLC, vision and data for non-majors", "非専攻者向けPLC・ビジョン・データ実習", "面向非专业学生的PLC、视觉与数据实训"],
     "steps": [["run", "", "now"]]}
  ]
}
;
function freeze(x){Object.values(x).forEach(v=>{if(v&&typeof v==='object')freeze(v)});return Object.freeze(x)}
window.PROGRESS=freeze({asof:'2026-10-29',steps:DATA.steps,projects:DATA.projects});
})();
