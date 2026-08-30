package com.waaxxss.demo

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat

class BiometricDemoActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val status = TextView(this).apply { text = "WAAXXSS 생체인증 준비"; textSize = 18f }
        val button = Button(this).apply { text = "지문 · 생체인증" }
        val layout = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(48, 96, 48, 48)
            addView(status)
            addView(button)
        }
        setContentView(layout)

        val manager = BiometricManager.from(this)
        val authenticators = BiometricManager.Authenticators.BIOMETRIC_STRONG or
            BiometricManager.Authenticators.DEVICE_CREDENTIAL

        when (manager.canAuthenticate(authenticators)) {
            BiometricManager.BIOMETRIC_SUCCESS -> status.text = "생체인증 사용 가능"
            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> status.text = "기기에 지문/얼굴을 먼저 등록하세요."
            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> status.text = "생체인증 하드웨어가 없습니다."
            else -> status.text = "현재 생체인증을 사용할 수 없습니다."
        }

        val executor = ContextCompat.getMainExecutor(this)
        val prompt = BiometricPrompt(this, executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    status.text = "인증 성공 · WAAXXSS 접근 허용"
                }

                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    status.text = "인증 오류: $errString"
                }

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    status.text = "인증 실패 · 다시 시도하세요."
                }
            })

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("WAAXXSS")
            .setSubtitle("지문 또는 기기 생체인증으로 확인")
            .setAllowedAuthenticators(authenticators)
            .build()

        button.setOnClickListener { prompt.authenticate(promptInfo) }
    }
}
