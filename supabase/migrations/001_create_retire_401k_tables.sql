-- ==============================================================================
-- 001_create_retire_401k_tables.sql
-- 목적: Retire401kSmart 사이트의 401(k) 중도인출/은퇴 시뮬레이션 저장 및 보안 피드백 테이블 생성
-- 규칙 준수:
--   1. 파일명 앞에 001_ 순서 번호 부여 및 supabase/migrations 폴더 내 정리
--   2. 모든 사용자 메모 및 식별 정보는 클라이언트에서 AES-256-GCM / SHA-256 암호화 후 저장
--   3. Row Level Security (RLS) 활성화로 익명 사용자의 타인 데이터 조회 원천 차단
-- ==============================================================================

-- 1. 401(k) 인출 및 은퇴 시나리오 저장 테이블
CREATE TABLE IF NOT EXISTS public.retire_401k_scenarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    state_slug VARCHAR(64) NOT NULL,            -- 선택한 주 슬러그
    withdrawal_amount NUMERIC(12, 2) NOT NULL,  -- 인출 희망 금액 ($)
    federal_tax_amount NUMERIC(12, 2) NOT NULL, -- 연방 소득세 ($)
    state_tax_amount NUMERIC(12, 2) NOT NULL,   -- 주 소득세 ($)
    penalty_amount NUMERIC(12, 2) NOT NULL,     -- 조기 인출 페널티 (10% IRS + 주 페널티, $)
    net_payout_cash NUMERIC(12, 2) NOT NULL,    -- 실제 손에 쥐는 실수령액 ($)
    lost_future_value NUMERIC(14, 2) NOT NULL,  -- 은퇴 시점 기회비용 손실액 ($)
    encrypted_note TEXT                         -- 클라이언트 AES-256-GCM 암호화된 메모
);

CREATE INDEX IF NOT EXISTS idx_retire_401k_scenarios_state ON public.retire_401k_scenarios (state_slug);
CREATE INDEX IF NOT EXISTS idx_retire_401k_scenarios_created_at ON public.retire_401k_scenarios (created_at DESC);

ALTER TABLE public.retire_401k_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous 401k scenario insert"
    ON public.retire_401k_scenarios
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 2. 사이트 보안 피드백 테이블
CREATE TABLE IF NOT EXISTS public.retire_401k_feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    category VARCHAR(50) NOT NULL,
    email_sha256_hash VARCHAR(128),
    encrypted_contact TEXT,
    message TEXT NOT NULL,
    page_url TEXT,
    status VARCHAR(30) DEFAULT 'new' NOT NULL
);

ALTER TABLE public.retire_401k_feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous 401k feedback insert"
    ON public.retire_401k_feedbacks
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

