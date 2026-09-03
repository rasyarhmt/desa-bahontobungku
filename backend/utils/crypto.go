package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"

	"io"

	"github.com/rasyarhmt/desa-bahontobungku/config"
)

func GetMasterKEK() []byte {
	hash := sha256.Sum256([]byte(config.AppConfig.MasterKEK))
	return hash[:]
}

func GenerateDEK() ([]byte, error) {
	key := make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, key); err != nil {
		return nil, err
	}
	return key, nil
}

func EncryptWithKey(plaintext []byte, key []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	return gcm.Seal(nonce, nonce, plaintext, nil), nil
}

func DecryptWithKey(ciphertext []byte, key []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return nil, errors.New("ciphertext terlalu pendek")
	}

	nonce, actualCiphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	return gcm.Open(nil, nonce, actualCiphertext, nil)
}

func EncryptString(text string, key []byte) (string, error) {
	if text == "" {
		return "", nil
	}
	encrypted, err := EncryptWithKey([]byte(text), key)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(encrypted), nil
}

func DecryptString(b64 string, key []byte) (string, error) {
	if b64 == "" {
		return "", nil
	}
	decoded, err := base64.StdEncoding.DecodeString(b64)
	if err != nil {
		return "", err
	}
	decrypted, err := DecryptWithKey(decoded, key)
	if err != nil {
		return "", err
	}
	return string(decrypted), nil
}

func EncryptJSON(data interface{}, key []byte) (DBJSON, error) {
	if data == nil {
		return DBJSON(`{}`), nil
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	encrypted, err := EncryptWithKey(jsonData, key)
	if err != nil {
		return nil, err
	}

	b64 := base64.StdEncoding.EncodeToString(encrypted)
	wrapped := map[string]string{"encrypted_payload": b64}

	resultBytes, err := json.Marshal(wrapped)
	if err != nil {
		return nil, err
	}

	return DBJSON(resultBytes), nil
}

func DecryptJSON(encryptedJSON DBJSON, key []byte) (DBJSON, error) {
	if len(encryptedJSON) == 0 {
		return nil, nil
	}

	var wrapped map[string]string
	if err := json.Unmarshal(encryptedJSON, &wrapped); err != nil {
		return nil, err
	}

	if b64, exists := wrapped["encrypted_payload"]; exists {
		decoded, err := base64.StdEncoding.DecodeString(b64)
		if err != nil {
			return nil, err
		}

		decrypted, err := DecryptWithKey(decoded, key)
		if err != nil {
			return nil, err
		}

		return DBJSON(decrypted), nil
	}

	return encryptedJSON, nil
}
