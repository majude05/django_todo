# todo_app/management/commands/fetch_holidays.py
import datetime
from django.core.management.base import BaseCommand
from googleapiclient.discovery import build
from django.conf import settings # settings.py からAPIキーを読み込むため
from todo_app.models import Holiday # 作成したHolidayモデル
from dateutil import parser as dateutil_parser # 日付文字列のパース

class Command(BaseCommand):
    help = 'Google Calendar APIから日本の祝日情報を取得し、データベースに保存します。'

    def add_arguments(self, parser):
        parser.add_argument(
            '--year',
            type=int,
            default=datetime.date.today().year,
            help='取得する祝日の年 (デフォルト: 今年)'
        )
        parser.add_argument(
            '--next-year',
            action='store_true',
            help='来年の祝日も取得します'
        )


    def handle(self, *args, **options):
        api_key = getattr(settings, 'GOOGLE_CALENDAR_API_KEY', None)
        if not api_key:
            self.stderr.write(self.style.ERROR('設定ファイルに GOOGLE_CALENDAR_API_KEY が見つかりません。'))
            return

        calendar_id = 'ja.japanese#holiday@group.v.calendar.google.com'
        years_to_fetch = [options['year']]
        if options['next_year']:
            years_to_fetch.append(options['year'] + 1)

        service = build('calendar', 'v3', developerKey=api_key)

        for year in years_to_fetch:
            self.stdout.write(f"{year}年の祝日を取得中...")
            try:
                # APIリクエストのパラメータ (1月1日から12月31日まで)
                time_min = datetime.datetime(year, 1, 1).isoformat() + 'Z'
                time_max = datetime.datetime(year, 12, 31, 23, 59, 59).isoformat() + 'Z'

                events_result = service.events().list(
                    calendarId=calendar_id,
                    timeMin=time_min,
                    timeMax=time_max,
                    singleEvents=True,
                    orderBy='startTime'
                ).execute()
                
                holidays = events_result.get('items', [])

                if not holidays:
                    self.stdout.write(self.style.WARNING(f'{year}年の祝日が見つかりませんでした。'))
                    continue

                saved_count = 0
                updated_count = 0
                for event in holidays:
                    summary = event['summary']
                    # Google Calendar API は 'YYYY-MM-DD' 形式で日付を返す
                    try:
                        # 'date' フィールドが存在するか確認 (終日イベントの場合)
                        if 'date' in event['start']:
                            holiday_date_str = event['start']['date']
                            holiday_date = dateutil_parser.parse(holiday_date_str).date()
                        # 'dateTime' フィールドが存在する場合 (時間指定イベント、祝日では通常ないが念のため)
                        elif 'dateTime' in event['start']:
                            holiday_date_str = event['start']['dateTime']
                            holiday_date = dateutil_parser.parse(holiday_date_str).date() # 日付部分のみ取得
                        else:
                            self.stdout.write(self.style.WARNING(f"日付情報が見つからないイベント: {summary}"))
                            continue

                        holiday_obj, created = Holiday.objects.update_or_create(
                            date=holiday_date,
                            defaults={'name': summary}
                        )
                        if created:
                            saved_count += 1
                        else:
                            updated_count += 1
                    except Exception as e:
                        self.stderr.write(self.style.ERROR(f"祝日 '{summary}' の処理中にエラー: {e}"))


                self.stdout.write(self.style.SUCCESS(
                    f'{year}年: {saved_count}件の祝日を新規保存、{updated_count}件を更新しました。'
                ))

            except Exception as e:
                self.stderr.write(self.style.ERROR(f'{year}年の祝日取得中にエラーが発生しました: {e}'))