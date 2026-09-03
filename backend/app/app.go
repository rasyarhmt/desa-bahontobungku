package app

import (
	"github.com/rasyarhmt/desa-bahontobungku/config"
	"github.com/rasyarhmt/desa-bahontobungku/domain"
	"github.com/rasyarhmt/desa-bahontobungku/http/handler"
	"github.com/rasyarhmt/desa-bahontobungku/repository"
	"github.com/rasyarhmt/desa-bahontobungku/usecase"
)

type App struct {
	UserHandler     domain.UserHandler
	AuthHandler     domain.AuthHandler
	PendudukHandler domain.PendudukHandler
}

func InitApp(cfg *config.Config) App {
	userRepo := repository.NewUserRepository(config.DB)
	authRepo := repository.NewAuthRepository(config.DB)
	pendudukRepo := repository.NewPendudukRepository(config.DB)

	userUsecase := usecase.NewUserUsecase(userRepo, authRepo)
	authUsecase := usecase.NewAuthUsecase(authRepo, userRepo)
	pendudukUsecase := usecase.NewPendudukUsecase(pendudukRepo)

	userHandler := handler.NewUserHandler(userUsecase)
	authHandler := handler.NewAuthHandler(authUsecase)
	pendudukHandler := handler.NewPendudukHandler(pendudukUsecase)

	return App{
		UserHandler:     userHandler,
		AuthHandler:     authHandler,
		PendudukHandler: pendudukHandler,
	}
}
