package app

import (
	"github.com/rasyarhmt/desa-bahontobungku/config"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/http/handler"
	"github.com/rasyarhmt/desa-bahontobungku/repository"
	"github.com/rasyarhmt/desa-bahontobungku/usecase"
)

type App struct {
	UserHandler          domain.UserHandler
	AuthHandler          domain.AuthHandler
	PendudukHandler      domain.PendudukHandler
	SuratTemplateHandler domain.SuratTemplateHandler
}

func InitApp(cfg *config.Config) App {
	userRepo := repository.NewUserRepository(config.DB)
	authRepo := repository.NewAuthRepository(config.DB)
	pendudukRepo := repository.NewPendudukRepository(config.DB)
	suratTemplateRepo := repository.NewSuratTemplateRepository(config.DB)

	userUsecase := usecase.NewUserUsecase(userRepo, authRepo)
	authUsecase := usecase.NewAuthUsecase(authRepo, userRepo)
	pendudukUsecase := usecase.NewPendudukUsecase(pendudukRepo)
	suratTemplateUsecase := usecase.NewSuratTemplateUsecase(suratTemplateRepo)

	userHandler := handler.NewUserHandler(userUsecase)
	authHandler := handler.NewAuthHandler(authUsecase)
	pendudukHandler := handler.NewPendudukHandler(pendudukUsecase)
	suratTemplateHandler := handler.NewSuratTemplateHandler(suratTemplateUsecase)

	return App{
		UserHandler:          userHandler,
		AuthHandler:          authHandler,
		PendudukHandler:      pendudukHandler,
		SuratTemplateHandler: suratTemplateHandler,
	}
}
