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
	PelayananHandler     domain.PelayananHandler
	SuratMasukHandler    domain.SuratMasukHandler
	SuratKeluarHandler   domain.SuratKeluarHandler
	LogCetakSuratHandler domain.LogCetakSuratHandler
	BeritaHandler        domain.BeritaHandler
	PengumumanHandler    domain.PengumumanHandler
	DanaHandler          domain.DanaHandler
	MediaHandler         domain.MediaHandler
	AparaturHandler      domain.AparaturHandler
}

func InitApp(cfg *config.Config) App {
	userRepo := repository.NewUserRepository(config.DB)
	authRepo := repository.NewAuthRepository(config.DB)
	pendudukRepo := repository.NewPendudukRepository(config.DB)
	suratTemplateRepo := repository.NewSuratTemplateRepository(config.DB)
	pelayananRepo := repository.NewPelayananRepository(config.DB)
	suratMasukRepo := repository.NewSuratMasukRepository(config.DB)
	suratKeluarRepo := repository.NewSuratKeluarRepository(config.DB)
	logCetakSuratRepo := repository.NewLogCetakSuratRepository(config.DB)
	beritaRepo := repository.NewBeritaRepository(config.DB)
	pengumumanRepo := repository.NewPengumumanRepository(config.DB)
	danaRepo := repository.NewDanaRepository(config.DB)
	mediaRepo := repository.NewMediaRepository(config.DB)
	aparaturRepo := repository.NewAparaturRepository(config.DB)

	userUsecase := usecase.NewUserUsecase(userRepo, authRepo)
	authUsecase := usecase.NewAuthUsecase(authRepo, userRepo)
	pendudukUsecase := usecase.NewPendudukUsecase(pendudukRepo)
	suratTemplateUsecase := usecase.NewSuratTemplateUsecase(suratTemplateRepo)
	pelayananUsecase := usecase.NewPelayananUsecase(pelayananRepo, suratTemplateRepo)
	suratMasukUsecase := usecase.NewSuratMasukUsecase(suratMasukRepo)
	suratKeluarUsecase := usecase.NewSuratKeluarUsecase(suratKeluarRepo)
	logCetakSuratUsecase := usecase.NewLogCetakSuratUsecase(logCetakSuratRepo, suratTemplateRepo, pelayananRepo)
	beritaUsecase := usecase.NewBeritaUsecase(beritaRepo)
	pengumumanUsecase := usecase.NewPengumumanUsecase(pengumumanRepo)
	danaUsecase := usecase.NewDanaUsecase(danaRepo)
	mediaUsecase := usecase.NewMediaUsecase(mediaRepo)
	aparaturUsecase := usecase.NewAparaturUsecase(aparaturRepo)

	userHandler := handler.NewUserHandler(userUsecase)
	authHandler := handler.NewAuthHandler(authUsecase)
	pendudukHandler := handler.NewPendudukHandler(pendudukUsecase)
	suratTemplateHandler := handler.NewSuratTemplateHandler(suratTemplateUsecase)
	pelayananHandler := handler.NewPelayananHandler(pelayananUsecase)
	suratMasukHandler := handler.NewSuratMasukHandler(suratMasukUsecase)
	suratKeluarHandler := handler.NewSuratKeluarHandler(suratKeluarUsecase)
	logCetakSuratHandler := handler.NewLogCetakSuratHandler(logCetakSuratUsecase)
	beritaHandler := handler.NewBeritaHandler(beritaUsecase)
	pengumumanHandler := handler.NewPengumumanHandler(pengumumanUsecase)
	danaHandler := handler.NewDanaHandler(danaUsecase)
	mediaHandler := handler.NewMediaHandler(mediaUsecase)
	aparaturHandler := handler.NewAparaturHandler(aparaturUsecase)

	return App{
		UserHandler:          userHandler,
		AuthHandler:          authHandler,
		PendudukHandler:      pendudukHandler,
		SuratTemplateHandler: suratTemplateHandler,
		PelayananHandler:     pelayananHandler,
		SuratMasukHandler:    suratMasukHandler,
		SuratKeluarHandler:   suratKeluarHandler,
		LogCetakSuratHandler: logCetakSuratHandler,
		BeritaHandler:        beritaHandler,
		PengumumanHandler:    pengumumanHandler,
		DanaHandler:          danaHandler,
		MediaHandler:         mediaHandler,
		AparaturHandler:      aparaturHandler,
	}
}
