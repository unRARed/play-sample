Rails.application.routes.draw do
  devise_for :users
  
  # Root path
  root "home#index"
  
  # RESTful resources
  resources :sample_pads do
    resources :samples, except: [:show]
  end
  
  # Player control routes
  resources :sample_pads do
    resources :samples, only: [] do
      member do
        match :play, via: [:get, :post]
      end
    end
  end
  post "/samples/stop_all", to: "samples#stop_all", as: :stop_all_samples
  get "home/index"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
