package dto

type (
	LoginRequestDTO struct {
		Email    string `json:"email" binding:"required,email" example:"admin@desa.test"`
		Password string `json:"password" binding:"required" example:"Rahasia123!"`
	}

	LoginResponseDTO struct {
		User         UserResponseDTO `json:"user"`
		AccessToken  string          `json:"access_token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
		RefreshToken string          `json:"refresh_token" example:"dGhpc0lzUmVmcmVGb2tlblRva2Vu..."`
	}

	RefreshTokenRequestDTO struct {
		RefreshToken string `json:"refresh_token" binding:"required" example:"dGhpc0lzUmVmcmVGb2tlblRva2Vu..."`
	}

	RefreshTokenResponseDTO struct {
		AccessToken  string `json:"access_token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
		RefreshToken string `json:"refresh_token" example:"dGhpc0lzUmVmcmVGb2tlblRva2Vu..."`
	}
)
