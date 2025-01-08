import { createClient } from "@/libs/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export async function LeagueScoring({ leagueId }: { leagueId: string }) {
  const supabase = createClient()
  
  const { data: scoringSettings } = await supabase
    .from("league_settings")
    .select("*")
    .eq("league_id", leagueId)

  const draftSettings = scoringSettings?.find(setting => setting.setting_name === "draft_settings")
  const roundScoring = scoringSettings?.filter(setting => setting.setting_name.startsWith("round_"))

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Draft Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {draftSettings ? (
            <div>
              <p>Draft Time: {JSON.parse(draftSettings.setting_value).draft_time}</p>
              <p>Picks Per Second: {JSON.parse(draftSettings.setting_value).picks_per_second}</p>
            </div>
          ) : (
            <p>Draft settings not available</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Scoring Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {roundScoring?.map((setting) => (
              <li key={setting.id}>
                Round {setting.setting_name.split('_')[1]}: {setting.setting_value} points
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

