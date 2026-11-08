package dto

type (
	TemplateFieldDTO struct {
		Key      string   `json:"key" example:"alamat"`
		Label    string   `json:"label" example:"Alamat"`
		Tipe     string   `json:"tipe" example:"textarea"`
		Options  []string `json:"options"`
		Required bool     `json:"required" example:"true"`
		Urutan   int      `json:"urutan" example:"1"`
	}

	TemplateFieldUpdateItemDTO struct {
		Key      string   `json:"key" binding:"required" example:"alamat"`
		Label    string   `json:"label" binding:"required" example:"Alamat"`
		Tipe     string   `json:"tipe" binding:"required" example:"textarea"`
		Options  []string `json:"options"`
		Required *bool    `json:"required"`
		Urutan   int      `json:"urutan" example:"1"`
	}

	TemplateFieldsUpdateRequestDTO struct {
		Fields []TemplateFieldUpdateItemDTO `json:"fields" binding:"required,dive"`
	}
)
