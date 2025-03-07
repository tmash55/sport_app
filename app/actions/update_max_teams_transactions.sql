DECLARE
  current_member_count INT;
BEGIN
  -- Update max_teams in the league_settings table
  UPDATE league_settings
  SET max_teams = update_max_teams_transaction.max_teams -- Explicit reference
  WHERE league_settings.league_id = update_max_teams_transaction.league_id; -- Explicit reference

  -- Get the current count of league_members for the league
  SELECT COUNT(*) INTO current_member_count
  FROM league_members
  WHERE league_members.league_id = update_max_teams_transaction.league_id; -- Explicit reference

  -- Add additional league_members if new max_teams is greater than the current count
  IF update_max_teams_transaction.max_teams > current_member_count THEN
    FOR i IN current_member_count + 1 .. update_max_teams_transaction.max_teams LOOP
      INSERT INTO league_members (league_id, user_id, team_name, joined_at, draft_position, avatar_url)
      VALUES (update_max_teams_transaction.league_id, NULL, CONCAT('Team ', i), NULL, NULL, NULL);
    END LOOP;
  END IF;

  -- Remove extra league_members if new max_teams is less than the current count
  IF update_max_teams_transaction.max_teams < current_member_count THEN
    WITH members_to_remove AS (
      SELECT id
      FROM league_members
      WHERE league_members.league_id = update_max_teams_transaction.league_id -- Explicit reference
      AND user_id IS NULL
      LIMIT current_member_count - update_max_teams_transaction.max_teams
    )
    DELETE FROM league_members
    WHERE league_members.id IN (SELECT id FROM members_to_remove);
  END IF;
END;