"""
AI を使用して企業情報を自動取得するサービス
Google Gemini API を使用（無料）
"""

import os
import json
from typing import Optional, Dict
from dotenv import load_dotenv

# 環境変数を読み込む
load_dotenv()

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-generativeai がインストールされていません")


class AICompanyInfoService:
    """企業情報を AI で自動取得するサービス"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        
        if GEMINI_AVAILABLE and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
            except Exception as e:
                print(f"Gemini API の初期化に失敗: {e}")
    
    def is_available(self) -> bool:
        """AI サービスが利用可能かチェック"""
        return GEMINI_AVAILABLE and self.model is not None and self.api_key is not None
    
    async def get_company_info(self, company_name: str) -> Dict[str, Optional[str]]:
        """
        企業名から業界、職種などの情報を AI で取得
        
        Args:
            company_name: 企業名
            
        Returns:
            企業情報の辞書（industry, job_type, location, salary, website_url）
        """
        if not self.is_available():
            return {
                "industry": None,
                "job_type": None,
                "location": None,
                "salary": None,
                "website_url": None,
                "error": "AI サービスが利用できません。GEMINI_API_KEY を設定してください。"
            }
        
        try:
            prompt = f"""
以下の企業について、日本の就職活動で役立つ情報をJSON形式で提供してください。
実在する企業の場合は正確な情報を、不明な場合は一般的な推測を記載してください。

企業名: {company_name}

以下のJSON形式で回答してください（コードブロックなし、JSONのみ）:
{{
  "industry": "業界（例: IT・ソフトウェア、金融、製造、コンサルティングなど）",
  "job_type": "主な職種（例: エンジニア、営業、企画、コンサルタントなど）",
  "location": "主な勤務地（例: 東京、大阪、全国など）",
  "salary": "初任給の目安（例: 25万円、30万円など）",
  "website_url": "企業の公式ウェブサイトURL（推測可能な場合）"
}}

不明な項目は null としてください。
"""
            
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # JSONの抽出（コードブロックで囲まれている場合も対応）
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            # JSON をパース
            company_info = json.loads(response_text)
            
            return {
                "industry": company_info.get("industry"),
                "job_type": company_info.get("job_type"),
                "location": company_info.get("location"),
                "salary": company_info.get("salary"),
                "website_url": company_info.get("website_url"),
            }
            
        except json.JSONDecodeError as e:
            print(f"JSON パースエラー: {e}")
            print(f"レスポンス: {response_text}")
            return {
                "industry": None,
                "job_type": None,
                "location": None,
                "salary": None,
                "website_url": None,
                "error": "AI からの応答を解析できませんでした"
            }
        except Exception as e:
            print(f"企業情報取得エラー: {e}")
            return {
                "industry": None,
                "job_type": None,
                "location": None,
                "salary": None,
                "website_url": None,
                "error": f"エラーが発生しました: {str(e)}"
            }


# シングルトンインスタンス
ai_service = AICompanyInfoService()
