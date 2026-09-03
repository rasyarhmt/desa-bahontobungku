package dto

type (
	LoginRequestDTO struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	LoginResponseDTO struct {
		User         UserResponseDTO `json:"user"`
		AccessToken  string          `json:"access_token"`
		RefreshToken string          `json:"refresh_token"`
	}

	RefreshTokenRequestDTO struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	RefreshTokenResponseDTO struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
	}
)
