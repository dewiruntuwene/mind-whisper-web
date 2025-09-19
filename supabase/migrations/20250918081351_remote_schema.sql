
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
COMMENT ON SCHEMA "public" IS 'standard public schema';
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";
SET default_tablespace = '';
SET default_table_access_method = "heap";
CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text",
    "session_duration" integer DEFAULT 0,
    "language" "text" DEFAULT 'en'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "conversations_language_check" CHECK (("language" = ANY (ARRAY['en'::"text", 'id'::"text"])))
);
ALTER TABLE "public"."conversations" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "content" "text" NOT NULL,
    "language" "text" DEFAULT 'en'::"text",
    "mood_indicator" "text",
    "energy_indicator" "text",
    "coherence_indicator" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "messages_coherence_indicator_check" CHECK (("coherence_indicator" = ANY (ARRAY['clear'::"text", 'unclear'::"text"]))),
    CONSTRAINT "messages_energy_indicator_check" CHECK (("energy_indicator" = ANY (ARRAY['high'::"text", 'normal'::"text", 'low'::"text"]))),
    CONSTRAINT "messages_language_check" CHECK (("language" = ANY (ARRAY['en'::"text", 'id'::"text"]))),
    CONSTRAINT "messages_mood_indicator_check" CHECK (("mood_indicator" = ANY (ARRAY['positive'::"text", 'neutral'::"text", 'concerning'::"text"]))),
    CONSTRAINT "messages_type_check" CHECK (("type" = ANY (ARRAY['user'::"text", 'ai'::"text"])))
);
ALTER TABLE "public"."messages" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "display_name" "text",
    "preferred_language" "text" DEFAULT 'en'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "profiles_preferred_language_check" CHECK (("preferred_language" = ANY (ARRAY['en'::"text", 'id'::"text"])))
);
ALTER TABLE "public"."profiles" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."wellness_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "conversation_id" "uuid",
    "overall_score" integer,
    "mood_score" integer,
    "mood_trend" "text",
    "mood_status" "text",
    "energy_score" integer,
    "energy_trend" "text",
    "energy_status" "text",
    "coherence_score" integer,
    "coherence_trend" "text",
    "coherence_status" "text",
    "engagement_score" integer,
    "engagement_trend" "text",
    "engagement_status" "text",
    "warning_flags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "wellness_metrics_coherence_score_check" CHECK ((("coherence_score" >= 0) AND ("coherence_score" <= 100))),
    CONSTRAINT "wellness_metrics_coherence_status_check" CHECK (("coherence_status" = ANY (ARRAY['clear'::"text", 'unclear'::"text"]))),
    CONSTRAINT "wellness_metrics_coherence_trend_check" CHECK (("coherence_trend" = ANY (ARRAY['up'::"text", 'down'::"text", 'stable'::"text"]))),
    CONSTRAINT "wellness_metrics_energy_score_check" CHECK ((("energy_score" >= 0) AND ("energy_score" <= 100))),
    CONSTRAINT "wellness_metrics_energy_status_check" CHECK (("energy_status" = ANY (ARRAY['high'::"text", 'normal'::"text", 'low'::"text"]))),
    CONSTRAINT "wellness_metrics_energy_trend_check" CHECK (("energy_trend" = ANY (ARRAY['up'::"text", 'down'::"text", 'stable'::"text"]))),
    CONSTRAINT "wellness_metrics_engagement_score_check" CHECK ((("engagement_score" >= 0) AND ("engagement_score" <= 100))),
    CONSTRAINT "wellness_metrics_engagement_status_check" CHECK (("engagement_status" = ANY (ARRAY['active'::"text", 'passive'::"text"]))),
    CONSTRAINT "wellness_metrics_engagement_trend_check" CHECK (("engagement_trend" = ANY (ARRAY['up'::"text", 'down'::"text", 'stable'::"text"]))),
    CONSTRAINT "wellness_metrics_mood_score_check" CHECK ((("mood_score" >= 0) AND ("mood_score" <= 100))),
    CONSTRAINT "wellness_metrics_mood_status_check" CHECK (("mood_status" = ANY (ARRAY['positive'::"text", 'neutral'::"text", 'concerning'::"text"]))),
    CONSTRAINT "wellness_metrics_mood_trend_check" CHECK (("mood_trend" = ANY (ARRAY['up'::"text", 'down'::"text", 'stable'::"text"]))),
    CONSTRAINT "wellness_metrics_overall_score_check" CHECK ((("overall_score" >= 0) AND ("overall_score" <= 100)))
);
ALTER TABLE "public"."wellness_metrics" OWNER TO "postgres";
ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");
ALTER TABLE ONLY "public"."wellness_metrics"
    ADD CONSTRAINT "wellness_metrics_pkey" PRIMARY KEY ("id");
CREATE INDEX "idx_conversations_created_at" ON "public"."conversations" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_conversations_user_id" ON "public"."conversations" USING "btree" ("user_id");
CREATE INDEX "idx_messages_conversation_id" ON "public"."messages" USING "btree" ("conversation_id");
CREATE INDEX "idx_messages_created_at" ON "public"."messages" USING "btree" ("created_at");
CREATE INDEX "idx_wellness_metrics_created_at" ON "public"."wellness_metrics" USING "btree" ("created_at" DESC);
CREATE INDEX "idx_wellness_metrics_user_id" ON "public"."wellness_metrics" USING "btree" ("user_id");
CREATE OR REPLACE TRIGGER "update_conversations_updated_at" BEFORE UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."wellness_metrics"
    ADD CONSTRAINT "wellness_metrics_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;
ALTER TABLE ONLY "public"."wellness_metrics"
    ADD CONSTRAINT "wellness_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
CREATE POLICY "Users can create messages in their conversations" ON "public"."messages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND ("conversations"."user_id" = "auth"."uid"())))));
CREATE POLICY "Users can create their own conversations" ON "public"."conversations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can create their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can create their own wellness metrics" ON "public"."wellness_metrics" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can delete their own conversations" ON "public"."conversations" FOR DELETE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update their own conversations" ON "public"."conversations" FOR UPDATE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can update their own wellness metrics" ON "public"."wellness_metrics" FOR UPDATE USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can view messages from their conversations" ON "public"."messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND ("conversations"."user_id" = "auth"."uid"())))));
CREATE POLICY "Users can view their own conversations" ON "public"."conversations" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can view their own wellness metrics" ON "public"."wellness_metrics" FOR SELECT USING (("auth"."uid"() = "user_id"));
ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."wellness_metrics" ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";
GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";
GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT ALL ON TABLE "public"."wellness_metrics" TO "anon";
GRANT ALL ON TABLE "public"."wellness_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."wellness_metrics" TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";

RESET ALL;
