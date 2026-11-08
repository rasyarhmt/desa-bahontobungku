package app

import (
	"github.com/rasyarhmt/desa-bahontobungku/config"
	"github.com/rasyarhmt/desa-bahontobungku/http/handler"
	"github.com/rasyarhmt/desa-bahontobungku/repository"
	"github.com/rasyarhmt/desa-bahontobungku/usecase"
)

type App struct {
	UserHandler           handler.UserHandler
	AuthHandler           handler.AuthHandler
	PendudukHandler       handler.PendudukHandler
	StatusKeluargaHandler handler.StatusKeluargaHandler
	SuratTemplateHandler  handler.SuratTemplateHandler
	PelayananHandler      handler.PelayananHandler
	SuratMasukHandler     handler.SuratMasukHandler
	SuratKeluarHandler    handler.SuratKeluarHandler
	LogCetakSuratHandler  handler.LogCetakSuratHandler
	BeritaHandler         handler.BeritaHandler
	PengumumanHandler     handler.PengumumanHandler
	DanaHandler           handler.DanaHandler
	MediaHandler          handler.MediaHandler
	AparaturHandler       handler.AparaturHandler
}

func InitApp(cfg *config.Config) App {
	userRepo := repository.NewUserRepository(config.DB)
	authRepo := repository.NewAuthRepository(config.DB)
	pendudukRepo := repository.NewPendudukRepository(config.DB)
	statusKeluargaRepo := repository.NewStatusKeluargaRepository(config.DB)
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
	suratTemplateFieldRepo := repository.NewSuratTemplateFieldRepository(config.DB)

	userUsecase := usecase.NewUserUsecase(userRepo, authRepo)
	authUsecase := usecase.NewAuthUsecase(authRepo, userRepo)
	pendudukUsecase := usecase.NewPendudukUsecase(pendudukRepo, statusKeluargaRepo)
	statusKeluargaUsecase := usecase.NewStatusKeluargaUsecase(statusKeluargaRepo)
	suratTemplateUsecase := usecase.NewSuratTemplateUsecase(suratTemplateRepo, suratTemplateFieldRepo)
	pelayananUsecase := usecase.NewPelayananUsecase(pelayananRepo, suratTemplateRepo, suratTemplateFieldRepo)
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
	statusKeluargaHandler := handler.NewStatusKeluargaHandler(statusKeluargaUsecase)
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
		UserHandler:           userHandler,
		AuthHandler:           authHandler,
		PendudukHandler:       pendudukHandler,
		StatusKeluargaHandler: statusKeluargaHandler,
		SuratTemplateHandler:  suratTemplateHandler,
		PelayananHandler:      pelayananHandler,
		SuratMasukHandler:     suratMasukHandler,
		SuratKeluarHandler:    suratKeluarHandler,
		LogCetakSuratHandler:  logCetakSuratHandler,
		BeritaHandler:         beritaHandler,
		PengumumanHandler:     pengumumanHandler,
		DanaHandler:           danaHandler,
		MediaHandler:          mediaHandler,
		AparaturHandler:       aparaturHandler,
	}
}
