class HomeController < ApplicationController
  def index
    if user_signed_in?
      @sample_pad = current_user.sample_pad
    end
  end
end
