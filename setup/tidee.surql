-- ------------------------------
-- OPTION
-- ------------------------------

OPTION IMPORT;

-- ------------------------------
-- ACCESSES
-- ------------------------------

DEFINE ACCESS membres ON DATABASE TYPE RECORD SIGNIN (SELECT * FROM membres WHERE email = $email AND crypto::argon2::compare(pass, $password)) WITH JWT ALGORITHM HS512 KEY 'JWT_KEY' WITH ISSUER KEY 'ISSUER_KEY' DURATION FOR TOKEN 2w, FOR SESSION 4h;

-- ------------------------------
-- FUNCTIONS
-- ------------------------------

DEFINE FUNCTION fn::permissions($id: record<membres>) -> array<record<permissions>> { RETURN array::group([(SELECT permissions FROM membres WHERE id = $id).permissions[0], array::group((SELECT permissions FROM poles WHERE $id INSIDE responsables).permissions)]); } COMMENT 'Renvoie toutes les permissions d’un membre' PERMISSIONS FULL;

-- ------------------------------
-- ANALYZERS
-- ------------------------------

DEFINE ANALYZER text_search TOKENIZERS BLANK FILTERS LOWERCASE;

-- ------------------------------
-- TABLE: appels
-- ------------------------------

DEFINE TABLE appels TYPE NORMAL SCHEMAFULL PERMISSIONS FOR select FULL, FOR create, update WHERE $session.rd INSIDE pole.responsables OR permissions:modifier_poles INSIDE fn::permissions($session.rd), FOR delete NONE;

DEFINE FIELD date ON appels TYPE string PERMISSIONS FULL;
DEFINE FIELD heures ON appels TYPE array<object> PERMISSIONS FULL;
DEFINE FIELD pole ON appels TYPE record<poles> PERMISSIONS FULL;
DEFINE FIELD responsable ON appels TYPE record<membres> PERMISSIONS FOR select NONE, FOR create, update FULL;

DEFINE INDEX uniqueness ON appels FIELDS date, pole UNIQUE;

-- ------------------------------
-- TABLE: membres
-- ------------------------------

DEFINE TABLE membres TYPE NORMAL SCHEMAFULL PERMISSIONS FOR select FULL, FOR create NONE, FOR update WHERE [permissions:gerer_membres, permissions:gerer_heures, permissions:modifier_poles] ANYINSIDE fn::permissions($session.rd) OR (SELECT VALUE id FROM poles WHERE $session.rd INSIDE responsables) ANYINSIDE poles, FOR delete WHERE permissions:supprimer_membres INSIDE fn::permissions($session.rd);

DEFINE FIELD email ON membres TYPE string PERMISSIONS FULL;
DEFINE FIELD heures ON membres TYPE int DEFAULT 0 PERMISSIONS FOR select, create FULL, FOR update WHERE [permissions:gerer_heures, permissions:modifier_poles] ANYINSIDE fn::permissions($auth.id) OR (SELECT VALUE id FROM poles WHERE $session.rd INSIDE responsables) ANYINSIDE poles;
DEFINE FIELD nom ON membres TYPE string PERMISSIONS FULL;
DEFINE FIELD pass ON membres TYPE string PERMISSIONS FOR select, update NONE, FOR create FULL;
DEFINE FIELD permissions ON membres TYPE array<record<permissions>> PERMISSIONS FULL;
DEFINE FIELD poles ON membres TYPE array<record<poles>> PERMISSIONS FULL;
DEFINE FIELD prenom ON membres TYPE string PERMISSIONS FULL;
DEFINE FIELD promotion ON membres TYPE string DEFAULT CIN1 PERMISSIONS FULL;

DEFINE INDEX email_uniqueness ON membres FIELDS email;

-- ------------------------------
-- TABLE: permissions
-- ------------------------------

DEFINE TABLE permissions TYPE NORMAL SCHEMAFULL PERMISSIONS NONE;

-- ------------------------------
-- TABLE DATA: permissions
-- ------------------------------

INSERT [ { id: permissions:administration }, { id: permissions:gerer_membres }, { id: permissions:gerer_permissions }, { id: permissions:modifier_config }, { id: permissions:modifier_pole_bureau }, { id: permissions:modifier_pole_cyber }, { id: permissions:modifier_pole_serveur }, { id: permissions:modifier_poles }, { id: permissions:notifications }, { id: permissions:planning_editer }, { id: permissions:planning_voir }, { id: permissions:supprimer_membres }, { id: permissions:voir_logs } ];

-- ------------------------------
-- TABLE: poles
-- ------------------------------

DEFINE TABLE poles TYPE NORMAL SCHEMAFULL PERMISSIONS FOR select FULL, FOR create, delete NONE, FOR update WHERE $session.rd INSIDE array::flatten((SELECT VALUE responsables FROM poles));

DEFINE FIELD meta ON poles FLEXIBLE TYPE object PERMISSIONS FULL;
DEFINE FIELD nom ON poles TYPE string PERMISSIONS FULL;
DEFINE FIELD permissions ON poles TYPE array<record<permissions>> PERMISSIONS FULL;
DEFINE FIELD poles ON poles TYPE array<record<poles>> PERMISSIONS FULL;
DEFINE FIELD responsables ON poles TYPE array<record<membres>> PERMISSIONS FULL;